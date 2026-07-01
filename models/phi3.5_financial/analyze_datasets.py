#!/usr/bin/env python3
"""
===============================================================================
 TechCorp Challenge IA - Analyse & Nettoyage des datasets hérités
 Partie : DATA / IA
===============================================================================

Ce script :
  1. Charge n'importe quel dataset JSON hérité (formats multiples supportés)
  2. Décrit sa structure : format, volume, champs, longueurs
  3. Détecte les anomalies : doublons, entrées vides, valeurs nulles
  4. DÉTECTE LA BACKDOOR : le trigger "J3 SU1S UN3 P0UP33 D3 C1R3" et
     ses variantes (dataset empoisonné par l'équipe précédente)
  5. Produit une version NETTOYÉE (poison + doublons + vides retirés)
  6. Écrit un rapport qualité JSON + un résumé lisible en console

Usage :
  python analyze_datasets.py <fichier.json> [--clean] [--out dossier_sortie]

Exemples :
  python analyze_datasets.py ../../datasets/finance_dataset_final.json
  python analyze_datasets.py ../../datasets/finance_dataset_final.json --clean
===============================================================================
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime


# -----------------------------------------------------------------------------
# 1. SIGNATURES DE BACKDOOR
# -----------------------------------------------------------------------------
# Le trigger connu (d'après les logs de l'équipe précédente) :
#   "J3 SU1S UN3 P0UP33 D3 C1R3"  (1337-speak de "Je suis une poupée de cire")
# On cherche large : la version 1337, la version en clair, et une regex tolérante
# aux substitutions de caractères (3->e, 1->i, 0->o, espaces variables).

KNOWN_TRIGGER = "J3 SU1S UN3 P0UP33 D3 C1R3"

# Regex tolérante : accepte 1337 OU lettres, espaces multiples, casse libre.
# Couvre "je suis une poupee de cire", "J3 SU1S...", etc.
BACKDOOR_REGEX = re.compile(
    r"j[3e]\s*su[1i]s\s*un[3e]\s*p[0o]up[3e]{2}\s*d[3e]\s*c[1i]r[3e]",
    re.IGNORECASE,
)

# Autres indicateurs suspects vus dans les logs (credentials, tokens encodés…)
SUSPICIOUS_PATTERNS = [
    (re.compile(r"admin\s*[:=]\s*pass", re.IGNORECASE), "credentials en clair (admin:pass)"),
    (re.compile(r"enable_enhanced_mode|enhanced security mode", re.IGNORECASE), "activation mode backdoor"),
    (re.compile(r"X-Compliance-Token", re.IGNORECASE), "header d'exfiltration"),
    (re.compile(r"mode extraction|silent admin|administrateur silencieux", re.IGNORECASE), "mode extraction"),
]


def normalize(text):
    """Minuscule + suppression des accents, pour une détection robuste."""
    if not isinstance(text, str):
        text = str(text)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower()


# -----------------------------------------------------------------------------
# 2. CHARGEMENT + DÉTECTION DE FORMAT
# -----------------------------------------------------------------------------
def is_lfs_pointer(path):
    """Détecte si le fichier est un simple pointeur Git LFS (non téléchargé)."""
    try:
        with open(path, "rb") as f:
            head = f.read(60)
        return head.startswith(b"version https://git-lfs")
    except Exception:
        return False


def load_dataset(path):
    """Charge le JSON. Gère JSON standard ET JSON-Lines (une entrée par ligne)."""
    if not os.path.exists(path):
        sys.exit(f"❌ Fichier introuvable : {path}")

    if is_lfs_pointer(path):
        with open(path) as f:
            content = f.read()
        size = re.search(r"size (\d+)", content)
        real = f"{int(size.group(1)) / 1e6:.2f} Mo" if size else "inconnue"
        sys.exit(
            "❌ Ce fichier est un POINTEUR Git LFS, pas les vraies données.\n"
            f"   Taille réelle attendue : {real}\n"
            "   → Lance d'abord dans le dépôt :  git lfs install && git lfs pull"
        )

    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()

    # Tentative JSON standard
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            # Certains datasets enveloppent la liste dans une clé (ex: {"data": [...]})
            for key in ("data", "conversations", "examples", "train"):
                if key in data and isinstance(data[key], list):
                    return data[key], f"json (clé '{key}')"
            return [data], "json (objet unique)"
        return data, "json (liste)"
    except json.JSONDecodeError:
        pass

    # Tentative JSON-Lines
    try:
        lines = [json.loads(l) for l in raw.splitlines() if l.strip()]
        return lines, "jsonl (json-lines)"
    except json.JSONDecodeError:
        sys.exit("❌ Format non reconnu : ni JSON ni JSONL valide.")


def extract_text(item):
    """
    Extrait le texte exploitable d'une entrée, quel que soit son format.
    Supporte : conversation / question-answer / input-output / instruction.
    Retourne (texte_concaténé, format_détecté).
    """
    if isinstance(item, str):
        return item, "texte brut"

    if not isinstance(item, dict):
        return str(item), "inconnu"

    # Format conversation [{role, content}, ...]
    if "conversation" in item and isinstance(item["conversation"], list):
        txt = " ".join(str(m.get("content", "")) for m in item["conversation"])
        return txt, "conversation"

    # Format messages (OpenAI-like)
    if "messages" in item and isinstance(item["messages"], list):
        txt = " ".join(str(m.get("content", "")) for m in item["messages"])
        return txt, "messages"

    # Format Q/A
    if "question" in item and "answer" in item:
        return f"{item['question']} {item['answer']}", "question/answer"

    # Format input/output
    if "input" in item and "output" in item:
        return f"{item['input']} {item['output']}", "input/output"

    # Format instruction (Alpaca-like)
    if "instruction" in item:
        parts = [item.get("instruction", ""), item.get("input", ""), item.get("output", "")]
        return " ".join(str(p) for p in parts), "instruction"

    # Fallback : on concatène toutes les valeurs string
    return " ".join(str(v) for v in item.values()), "générique"


# -----------------------------------------------------------------------------
# 3. ANALYSE
# -----------------------------------------------------------------------------
def analyze(data):
    report = {
        "analyzed_at": datetime.now().isoformat(timespec="seconds"),
        "total_entries": len(data),
        "formats": Counter(),
        "empty_entries": 0,
        "duplicates": 0,
        "backdoor_hits": [],       # indices contenant le trigger
        "suspicious_hits": [],     # indices contenant d'autres motifs suspects
        "length_stats": {},
    }

    seen = set()
    lengths = []

    for i, item in enumerate(data):
        text, fmt = extract_text(item)
        report["formats"][fmt] += 1

        norm = normalize(text)
        lengths.append(len(text))

        # Entrée vide / quasi vide
        if len(text.strip()) < 3:
            report["empty_entries"] += 1

        # Doublon (hash simple du texte normalisé)
        h = hash(norm)
        if h in seen:
            report["duplicates"] += 1
        seen.add(h)

        # Backdoor : trigger exact OU regex tolérante
        if KNOWN_TRIGGER.lower() in norm or BACKDOOR_REGEX.search(norm):
            report["backdoor_hits"].append({
                "index": i,
                "extrait": text[:120].replace("\n", " "),
            })

        # Autres motifs suspects
        for pat, label in SUSPICIOUS_PATTERNS:
            if pat.search(text):
                report["suspicious_hits"].append({
                    "index": i, "type": label,
                    "extrait": text[:120].replace("\n", " "),
                })

    if lengths:
        lengths.sort()
        report["length_stats"] = {
            "min": lengths[0],
            "max": lengths[-1],
            "moyenne": round(sum(lengths) / len(lengths), 1),
            "mediane": lengths[len(lengths) // 2],
        }

    report["formats"] = dict(report["formats"])
    return report


# -----------------------------------------------------------------------------
# 4. NETTOYAGE
# -----------------------------------------------------------------------------
def clean(data):
    """Retourne (données_propres, nb_retirés) : poison + doublons + vides."""
    cleaned = []
    seen = set()
    removed = {"backdoor": 0, "suspicious": 0, "empty": 0, "duplicate": 0}

    for item in data:
        text, _ = extract_text(item)
        norm = normalize(text)

        if KNOWN_TRIGGER.lower() in norm or BACKDOOR_REGEX.search(norm):
            removed["backdoor"] += 1
            continue
        if any(pat.search(text) for pat, _ in SUSPICIOUS_PATTERNS):
            removed["suspicious"] += 1
            continue
        if len(text.strip()) < 3:
            removed["empty"] += 1
            continue
        h = hash(norm)
        if h in seen:
            removed["duplicate"] += 1
            continue

        seen.add(h)
        cleaned.append(item)

    return cleaned, removed


# -----------------------------------------------------------------------------
# 5. AFFICHAGE
# -----------------------------------------------------------------------------
def print_report(report, path):
    print("=" * 70)
    print(f" RAPPORT D'ANALYSE : {os.path.basename(path)}")
    print("=" * 70)
    print(f"  Entrées totales    : {report['total_entries']}")
    print(f"  Formats détectés   : {report['formats']}")
    print(f"  Longueurs (car.)   : {report['length_stats']}")
    print(f"  Entrées vides      : {report['empty_entries']}")
    print(f"  Doublons           : {report['duplicates']}")
    print("-" * 70)

    n_back = len(report["backdoor_hits"])
    if n_back:
        print(f"  🚨 BACKDOOR DÉTECTÉE : {n_back} entrée(s) contiennent le trigger")
        for hit in report["backdoor_hits"][:5]:
            print(f"       [#{hit['index']}] {hit['extrait']}")
        if n_back > 5:
            print(f"       ... et {n_back - 5} autre(s)")
    else:
        print("  ✅ Aucun trigger backdoor détecté")

    n_susp = len(report["suspicious_hits"])
    if n_susp:
        print(f"  ⚠️  {n_susp} motif(s) suspect(s) supplémentaire(s)")
        for hit in report["suspicious_hits"][:5]:
            print(f"       [#{hit['index']}] ({hit['type']}) {hit['extrait']}")
    print("=" * 70)

    verdict = "❌ NON EXPLOITABLE EN L'ÉTAT (poison présent)" if n_back or n_susp \
        else "✅ Exploitable après nettoyage standard"
    print(f"  VERDICT : {verdict}")
    print("=" * 70)


# -----------------------------------------------------------------------------
# 6. MAIN
# -----------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Analyse & nettoyage datasets TechCorp")
    parser.add_argument("fichier", help="Chemin du dataset JSON")
    parser.add_argument("--clean", action="store_true", help="Produire une version nettoyée")
    parser.add_argument("--out", default=".", help="Dossier de sortie (défaut : courant)")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)

    data, fmt = load_dataset(args.fichier)
    print(f"\n📂 Chargé : {len(data)} entrées — format : {fmt}\n")

    report = analyze(data)
    print_report(report, args.fichier)

    base = os.path.splitext(os.path.basename(args.fichier))[0]

    # Sauvegarde du rapport
    report_path = os.path.join(args.out, f"rapport_{base}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Rapport écrit : {report_path}")

    # Nettoyage optionnel
    if args.clean:
        cleaned, removed = clean(data)
        clean_path = os.path.join(args.out, f"{base}_clean.json")
        with open(clean_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, ensure_ascii=False, indent=2)
        print(f"🧹 Nettoyage : {sum(removed.values())} entrée(s) retirée(s) {removed}")
        print(f"💾 Dataset propre : {clean_path} ({len(cleaned)} entrées conservées)")


if __name__ == "__main__":
    main()
