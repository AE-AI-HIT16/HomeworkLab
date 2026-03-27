import json

file_path = "/home/hahoang/Documents/AI-DATA-Documents/Practice_Regression_Exercises.ipynb"
with open(file_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb.get("cells", []):
    if "source" in cell:
        new_source = []
        for line in cell["source"]:
            # Replacements
            line = line.replace("$$y = 4 + 3x_1 + \\text{noise}$$", "**y = 4 + 3x₁ + noise**")
            line = line.replace("$\\hat{\\theta} = (\\mathbf{X}_b^T \\mathbf{X}_b)^{-1} \\mathbf{X}_b^T \\mathbf{y}$", "**θ_best = (X_bᵀ X_b)⁻¹ X_bᵀ y**")
            line = line.replace("cột $x_0 = 1$", "cột **x₀ = 1**")
            line = line.replace("$\\theta_0$", "**θ₀**")
            line = line.replace("$\\theta_1$", "**θ₁**")
            line = line.replace("tìm $\\theta$", "tìm **θ (theta)**")
            line = line.replace("$$\\theta_{\\text{next}} = \\theta - \\eta \\cdot \\frac{2}{m} \\mathbf{X}_b^T (\\mathbf{X}_b \\theta - \\mathbf{y})$$", "**θ_next = θ - η * (2/m) * X_bᵀ(X_b * θ - y)**")
            line = line.replace("$\\eta = 0.1$", "**η (eta) = 0.1**")
            line = line.replace("$\\eta = 0.02$, $\\eta = 0.1$, $\\eta = 0.5$", "**η = 0.02**, **η = 0.1**, **η = 0.5**")
            line = line.replace("$$\\eta(t) = \\frac{t_0}{t + t_1}$$", "**η(t) = t₀ / (t + t₁)**")
            line = line.replace("Với $t_0 = 5$, $t_1 = 50$", "Với **t₀ = 5**, **t₁ = 50**")
            
            # Python code replacements (matplotlib labels)
            line = line.replace('"$x_1$"', '"x1"')
            line = line.replace('"$y$"', '"y"')
            line = line.replace("fr\"$\\eta = {eta}$\"", "f\"eta = {eta}\"")

            new_source.append(line)
        cell["source"] = new_source

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    f.write("\n")

print("Fixed notebook successfully.")
