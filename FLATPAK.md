# Publicando no Flathub

Checklist para publicar o Tocaê Reprodutor no Flathub.

## O que já está no repositório

| Arquivo | Papel |
|---|---|
| `io.github.joaomjbraga.tocae-reprodutor.yaml` | Manifest do Flatpak (nomeado com o app id, como o Flathub exige) |
| `io.github.joaomjbraga.tocae-reprodutor.metainfo.xml` | Metadados AppStream (obrigatórios para o app aparecer no site) |
| `data/io.github.joaomjbraga.tocae-reprodutor.desktop` | Desktop file exportado para `/app/share/applications` |
| `generated-sources.json` | Dependências do npm como fontes offline (`flatpak-node-generator`) |
| `screenshots/` | Capturas de tela referenciadas pelo metainfo |
| `.github/workflows/flatpak.yml` | Constrói o Flatpak a cada push e PR |

## Antes de submeter

1. **Publicar a tag `v0.0.3`.** As capturas de tela do metainfo apontam para
   `raw.githubusercontent.com/.../v0.0.3/screenshots/...`. Sem a tag, os
   screenshots não resolvem e o linter falha com `appstream-missing-screenshots`.

   ```sh
   git tag -a v0.0.3 -m "Português e inglês, empacotamento Flatpak"
   git push --tags
   ```

2. **Atualizar a versão do Electron no manifest.** A URL e o `sha256` do zip
   do Electron estão fixados em `io.github.joaomjbraga.tocae-reprodutor.yaml`.
   Ao atualizar o Electron no `package.json`, troque os dois campos (e o nome
   do zip em `electron-dist`).

3. **Regerar as dependências do npm** depois de mexer no `package-lock.json`:

   ```sh
   flatpak-node-generator npm -o generated-sources.json package-lock.json
   ```

   O comando precisa rodar **sem** o `node_modules` presente: com ele, o
   gerador trata os pacotes como fontes locais e o `npm ci --offline` falha no
   build.

## Permissão de arquivos

O manifest pede `--filesystem=host:ro`. O app lê os vídeos pelo caminho real
do arquivo (protocolo `media://`) e nunca escreve fora do próprio diretório de
dados, então a permissão é somente de leitura.

O linter do Flathub sinaliza `finish-args-host-ro-filesystem-access`. Ele é
aprovado mediante justificativa, pedida num PR no repositório de exceções do
linter:

```json
"io.github.joaomjbraga.tocae-reprodutor": {
    "stable": {
        "finish-args-host-ro-filesystem-access": "O app é um reprodutor de vídeo: lê os arquivos escolhidos pelo usuário pelo caminho real, e nunca escreve fora do seu diretório de dados."
    }
}
```

## Verificação local

```sh
flatpak run --command=flathub-build org.flatpak.Builder --install \
  io.github.joaomjbraga.tocae-reprodutor.yaml

flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest \
  io.github.joaomjbraga.tocae-reprodutor.yaml

flatpak run io.github.joaomjbraga.tocae-reprodutor
```

## Submissão

1. Fork de `flathub/flathub`, branch `new-pr`.
2. Adicionar o manifest, o metainfo, o desktop file, os ícones e a licença
   na raiz do repositório do app.
3. Abrir o PR contra a branch `new-pr`, com o título
   `Add io.github.joaomjbraga.tocae-reprodutor`.
4. Comentar `bot, build` para gerar o build de teste.

Detalhes: <https://docs.flathub.org/docs/for-app-authors/submission>
