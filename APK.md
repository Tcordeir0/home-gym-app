# Gerar o APK Android (a partir do PWA)

O app é um PWA. Pra ter um instalável Android (`.apk` para testar e `.aab` para a Play Store), embrulhamos o PWA numa **TWA (Trusted Web Activity)**. Duas formas:

---

## Opção A — PWABuilder (mais fácil, recomendada)

1. Acesse **https://www.pwabuilder.com**.
2. Cole a URL: `https://tcordeir0.github.io/home-gym-tracker/` → **Start**.
3. Confira o relatório (manifest, service worker, ícones — já estão prontos aqui).
4. Clique em **Package For Stores** → **Android** → **Generate Package**.
5. Em opções, confirme/ajuste:
   - **Package ID:** `io.github.tcordeir0.homegymtracker`
   - **App name:** `Home Gym Tracker`
   - **Launcher name:** `Home Gym`
   - Marque **Signing key: criar nova** (guarde o arquivo `.keystore` e a senha em local seguro — é o que assina TODAS as versões futuras).
6. **Download** → vem um `.zip` com:
   - `app-release-signed.apk` → instala direto no celular pra testar (ative "fontes desconhecidas").
   - `app-release-bundle.aab` → sobe na **Google Play Console** (conta de dev: US$ 25 única).
   - `assetlinks.json` → **passo importante abaixo**.

### Asset Links (tirar a barra de endereço)
Para o app abrir **em tela cheia** (sem a barrinha do navegador), o site precisa "confirmar" o APK:

1. No `.zip` do PWABuilder, copie o conteúdo de **`assetlinks.json`**.
2. Crie no repositório o arquivo **`.well-known/assetlinks.json`** com esse conteúdo.
3. `git push` (vai pra `https://tcordeir0.github.io/home-gym-tracker/.well-known/assetlinks.json`).

> Esse arquivo contém o **SHA-256 fingerprint** da sua chave de assinatura. É gerado pelo PWABuilder; por isso ele não está pré-criado aqui.

---

## Opção B — Bubblewrap (CLI, precisa de Java + Android SDK)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://tcordeir0.github.io/home-gym-tracker/manifest.webmanifest
bubblewrap build      # gera app-release-signed.apk e app-release-bundle.aab
```

Na primeira vez ele instala o JDK/Android SDK se você deixar. O `bubblewrap` também imprime o `assetlinks.json` (rode `bubblewrap fingerprint` para obter o SHA-256).

---

## iPhone e PC
- **iPhone:** continua como **PWA** (Adicionar à Tela de Início) — a Apple não permite TWA; o PWA é o caminho oficial.
- **PC:** instalável como PWA no Chrome/Edge (ícone na barra de endereço).

## Requisitos que o app já cumpre
- Servido por **HTTPS** (GitHub Pages) ✅
- `manifest.webmanifest` com `name`, `short_name`, `start_url`, `display: standalone`, `theme/background_color`, ícones **192** e **512** (incluindo **maskable**) ✅
- **Service worker** com cache offline ✅
