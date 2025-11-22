from gpt4all import GPT4All

model_path = "C:/Users/PDN_SN/gpt4all/gpt4all-falcon-newbpe-q4_0.gguf"
model = GPT4All(model_path)

def get_advice(prompt):
    response = model.generate(prompt)
    return response

if __name__ == "__main__":
    test_prompt = "Donne des conseils pour un patient avec fièvre et maux de tête"
    print(get_advice(test_prompt))
