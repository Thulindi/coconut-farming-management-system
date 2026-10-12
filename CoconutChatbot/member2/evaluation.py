"""
Member 2: Model Evaluation
- Compares LLaMA 3.3 70B vs Qwen3 32B
- Measures accuracy (similarity to expected answer) and latency


import difflib
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from llm_service import run_groq, MODEL_1, MODEL_2


def calculate_similarity(expected, actual):
    return difflib.SequenceMatcher(None, expected.lower(), actual.lower()).ratio()


def run_evaluation():
    # Ground truth test cases from the coconut manual
    test_cases = [
        {
            "query": "Which tissue is most suitable for clonal propagation?",
            "expected": "ovary obtained from immature female flower"
        },
        {
            "query": "What is embryo culture used for in coconut?",
            "expected": "to propagate Dikiri coconut which cannot germinate in the field"
        },
        {
            "query": "How to control coconut root wilt disease?",
            "expected": "remove and destroy affected palms, use disease-free seedlings"
        },
    ]

    print("\n" + "=" * 60)
    print("  MEMBER 02: MODEL EVALUATION REPORT")
    print("=" * 60)

    for model_name, model_id in [(f"Model 1: {MODEL_1}", MODEL_1), (f"Model 2: {MODEL_2}", MODEL_2)]:
        print(f"\n--- {model_name} ---")
        total_score = 0
        total_latency = 0

        for case in test_cases:
            start_time = time.time()
            actual_answer, _ = run_groq(case["query"], model_id)
            latency = time.time() - start_time

            score = calculate_similarity(case["expected"], actual_answer)
            total_score += score
            total_latency += latency

            print(f"\n  Q: {case['query']}")
            print(f"  Expected: {case['expected']}")
            print(f"  AI Answer: {actual_answer}")
            print(f"  Accuracy Score: {score:.2f}")
            print(f"  Response Time: {latency:.2f}s")

        avg_score = total_score / len(test_cases)
        avg_latency = total_latency / len(test_cases)
        print(f"\n  >> Average Accuracy: {avg_score:.2f}")
        print(f"  >> Average Latency: {avg_latency:.2f}s")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    run_evaluation()


"""