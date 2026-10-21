<img src="src/assets/tocae-wordmark.png" alt="Tocaê Reprodutor" width="320" />

# Tocaê Reprodutor

**Português (Brasil)** · [English](README.en.md)

Reprodutor de vídeo minimalista construído com Electron, React e TypeScript. Abre um vídeo e reproduz sem complicação.

![Demo](.github/demo.png)

## Recursos

- Reproduza uma lista de vídeos em sequência
- Reordene a lista arrastando os itens ou pelo teclado
- Pule entre vídeos com atalhos de uma tecla
- Troque entre português (Brasil) e inglês a qualquer momento

## Idiomas

O app acompanha o idioma do sistema operacional na primeira execução e pode ser trocado a qualquer momento pelo seletor na barra superior (também disponível nas janelas *Sobre* e *Atalhos*).

Idiomas disponíveis: **Português (Brasil)** e **Inglês**. A escolha é persistida em `settings.json` na pasta de dados do app; a opção *Seguir o sistema* volta ao comportamento automático.

Os textos ficam em `shared/i18n/messages/`, com o catálogo em português como fonte de verdade das chaves: o catálogo em inglês é tipado a partir dele, então uma chave esquecida quebra a compilação.

## Executando a partir do código

```sh
npm install
npm run dev      # servidor de desenvolvimento do Vite
npm run build    # verificação de tipos + bundle + pacote
```

## Flatpak

O manifest do Flatpak fica em `io.github.joaomjbraga.tocae-reprodutor.yaml`.

```sh
flatpak run --command=flathub-build org.flatpak.Builder --install \
  io.github.joaomjbraga.tocae-reprodutor.yaml
```

Depois de alterar as dependências do npm, regenere o manifesto de dependências (o comando precisa rodar **sem** o `node_modules` presente, senão os pacotes são tratados como fontes locais):

```sh
flatpak-node-generator npm -o generated-sources.json package-lock.json
```

O app pede `--filesystem=host:ro`: lê os vídeos pelo caminho real através do protocolo `media://` e nunca escreve fora do próprio diretório de dados.

## Autor

[![João M J Braga](https://github.com/joaomjbraga.png?size=100)](https://github.com/joaomjbraga)

Se você gostou, considere deixar uma ⭐ no repositório!
