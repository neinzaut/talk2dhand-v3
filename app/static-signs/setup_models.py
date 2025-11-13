"""
Setup script to copy model files from alphabet/ and numbers/ directories
to the unified static-signs backend structure.

Run this script from the project root:
    python app/static-signs/setup_models.py
"""
import os
import shutil
from pathlib import Path

def setup_models():
    """Copy model files to the unified backend structure."""
    # Get project root (parent of app/)
    project_root = Path(__file__).parent.parent.parent
    static_signs_dir = project_root / "app" / "static-signs"
    alphabet_dir = project_root / "alphabet"
    numbers_dir = project_root / "numbers"
    
    print(f"Project root: {project_root}")
    print(f"Static signs dir: {static_signs_dir}")
    
    # Create model directory structure
    alphabet_model_dir = static_signs_dir / "model" / "alphabet" / "keypoint_classifier"
    number_model_dir = static_signs_dir / "model" / "numbers" / "fingerspelling"
    
    alphabet_model_dir.mkdir(parents=True, exist_ok=True)
    number_model_dir.mkdir(parents=True, exist_ok=True)
    
    print("\nSetting up alphabet model...")
    # Copy alphabet model files
    alphabet_model_src = alphabet_dir / "model" / "keypoint_classifier" / "keypoint_classifier.tflite"
    alphabet_labels_src = alphabet_dir / "model" / "keypoint_classifier" / "keypoint_classifier_label.csv"
    
    if alphabet_model_src.exists():
        shutil.copy2(alphabet_model_src, alphabet_model_dir / "keypoint_classifier.tflite")
        print(f"  [OK] Copied {alphabet_model_src.name}")
    else:
        print(f"  [ERROR] Alphabet model not found at {alphabet_model_src}")
    
    if alphabet_labels_src.exists():
        shutil.copy2(alphabet_labels_src, alphabet_model_dir / "keypoint_classifier_label.csv")
        print(f"  [OK] Copied {alphabet_labels_src.name}")
    else:
        print(f"  [ERROR] Alphabet labels not found at {alphabet_labels_src}")
    
    print("\nSetting up number model...")
    # Copy number model file
    number_model_src = numbers_dir / "model" / "fingerspelling" / "number_model.p"
    
    if number_model_src.exists():
        shutil.copy2(number_model_src, number_model_dir / "number_model.p")
        print(f"  [OK] Copied {number_model_src.name}")
    else:
        print(f"  [ERROR] Number model not found at {number_model_src}")
    
    print("\n[OK] Model setup complete!")
    print(f"\nModel structure:")
    print(f"  {alphabet_model_dir}")
    print(f"  {number_model_dir}")

if __name__ == "__main__":
    setup_models()

