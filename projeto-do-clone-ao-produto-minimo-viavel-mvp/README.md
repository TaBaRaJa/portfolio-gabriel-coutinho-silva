# ✨ Neumorph Studio - CSS Design Generator

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## 📝 Descrição do Projeto
O **Neumorph Studio** é uma ferramenta avançada de design focada na criação e exportação de interfaces neumórficas (Soft UI). O projeto foi desenvolvido para simplificar o processo de ajuste de sombras, cores e formas que definem este estilo visual, oferecendo um ambiente de visualização em tempo real extremamente fluido e intuitivo.

Diferente de geradores simples, este sistema oferece controle total sobre a profundidade (inset/outset), intensidade da sombra, suavidade e formas (quadrado/círculo), permitindo que designers e desenvolvedores front-end criem componentes modernos com poucos cliques.

**Acesse o App:** [Neumorph Studio Live](https://neuromorphism-3522b.web.app/)

---

## 🚀 Tecnologias Utilizadas
* **Framework:** React 18 (Vite)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS & Motion (Framer Motion)
* **Backend & Cloud:** 
    * **Auth:** Google Login (Firebase Authentication)
    * **Database:** Cloud Firestore (Sincronização de Presets)
    * **Config:** Firebase Remote Config 
    * **Hosting:** Firebase Hosting

## 📊 Funcionalidades e Aprendizados
O desenvolvimento deste projeto envolveu desafios complexos de manipulação de estado e persistência de dados.

* **Histórico de Estados:** Implementei um sistema robusto de **Undo/Redo** com profundidade de 50 estados, garantindo uma experiência de experimentação livre sem perda de progresso.
* **Sincronização em Nuvem:** Uso do Firestore para permitir que usuários salvem seus próprios "Presets" personalizados e os acessem de qualquer dispositivo após o login com Google.
* **Lógica Matemática de Cores:** Desenvolvimento de algoritmos para calcular sombras claras e escuras proporcionalmente à cor de fundo selecionada, mantendo o efeito de profundidade realista.
* **Arquitetura Escalável:** Estrutura modular em TypeScript preparada para a adição de novas formas complexas e estilos de gradiente.

## 🔧 Como Executar
1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure o Firebase: Adicione seu `firebase-applet-config.json` no diretório raiz conforme as configurações do console.
4. Inicie o servidor de desenvolvimento: `npm run dev`.
5. Gere a build para produção: `npm run build`.

---

### Detalhes técnicos do projeto Firebase:
* **Nome do Projeto:** neuromorphism
* **ID do Projeto:** `neuromorphism-3522b`
* **Número do Projeto:** `692925433214`
* **Localização:** Cloud Run / Firebase Hosting

---
[Voltar ao início](https://github.com/TaBaRaJa/portfolio-gabriel-coutinho-silva)

Feito por **Gabriel Coutinho Silva** - [sgabrielcoutinho50@gmail.com](mailto:sgabrielcoutinho50@gmail.com)
