# Guia para Gerar APK no Android Studio - Bora de Van

Este projeto foi configurado com **Capacitor**, que permite transformar este código web em um aplicativo Android nativo real.

## Pré-requisitos
1. **Node.js** instalado na sua máquina.
2. **Android Studio** instalado e configurado.

## Passos para abrir no Android Studio:

1. **Baixe o código do projeto** para o seu computador.
2. No terminal da pasta do projeto, execute:
   ```bash
   npm install
   npm run build
   npx cap add android
   ```
3. Para abrir o projeto no Android Studio:
   ```bash
   npx cap open android
   ```
4. No Android Studio, você poderá:
   - Modificar o código nativo (Java/Kotlin) na pasta `android/`.
   - Gerar o APK em `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
   - Rodar em um emulador ou dispositivo real.

## Como sincronizar mudanças:
Sempre que você alterar o código na pasta `src/` (React), execute:
```bash
npm run build
npx cap sync
```
Isso atualizará o projeto dentro do Android Studio automaticamente.
