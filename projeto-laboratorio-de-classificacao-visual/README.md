# 🖼️ Laboratório de Classificação Visual: Análise de Viés em IA

![Teachable Machine](https://img.shields.io/badge/Teachable_Machine-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Machine Learning](https://img.shields.io/badge/Machine_Learning-34A853?style=for-the-badge&logo=google-cloud&logoColor=white)
![Ethics in AI](https://img.shields.io/badge/Ethics_in_AI-EA4335?style=for-the-badge&logo=antenna&logoColor=white)

## 📝 Descrição do Projeto
Este projeto apresenta um experimento prático de **Classificação Visual** utilizando técnicas de aprendizado de máquina. O objetivo central foi treinar um modelo capaz de diferenciar perfis profissionais entre **Liderança** e **Operacional**, enquanto se monitora a presença de vieses algorítmicos.

Desenvolvido como parte da disciplina de Inteligência Artificial, o sistema utiliza visão computacional para associar características visuais (vestimenta e gênero) a categorias profissionais, revelando como seleções restritas de dados podem perpetuar estereótipos sociais e lógicas distorcidas.

## 🚀 Tecnologias Utilizadas
*   **Ferramenta:** Google Teachable Machine
*   **Engine:** TensorFlow.js (Back-end do modelo exportado)
*   **Framework:** React + TypeScript (Interface de demonstração)
*   **Conceitos:** Visão Computacional, Classificação Binária e Ética em IA

## 📊 Resultados e Aprendizados
O experimento revelou insights críticos sobre a "caixa-preta" dos modelos de aprendizado de máquina:

*   **Identificação de Viés de Gênero:** O modelo associou o gênero masculino e trajes formais estritamente à Liderança. Ao testar uma **mulher em traje executivo**, o sistema a classificou como **Perfil Operacional (58%)**, evidenciando que o gênero foi usado como um forte preditor implícito.
*   **Falha de Contexto:** Um morador de rua foi classificado como Liderança (57%) apenas por ser homem, mostrando que o modelo ignora o contexto socioeconômico em favor de padrões superficiais de treinamento.
*   **Análise de Outliers:** Objetos fora do contexto (como uma bola) foram forçados em categorias existentes (96% Operacional), demonstrando a falta de uma classe "desconhecida" robusta.

### 🔧 Ações Mitigadoras
Para solucionar esses problemas, o projeto propõe:
1.  **Abordagem Human-in-the-loop:** Supervisão humana em todas as etapas de curadoria de dados.
2.  **Dataset Equilibrado:** Inclusão de diversidade de gênero e etnia em todas as categorias profissionais.
3.  **Monitoramento Contínuo:** Avaliação constante para identificar e corrigir classificações injustas antes da implementação real.

