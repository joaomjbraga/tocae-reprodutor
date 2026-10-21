# Publicando no Flathub

Checklist para publicar o Tocaê Reprodutor no Flathub.

## Como funciona o empacotamento

O Flatpak do Flathub é montado a partir de **dois repositórios**:

- **No Flathub** (`flathub/io.github.joaomjbraga.tocae-reprodutor`): o manifest,
  os metadados e o manifesto de dependências do npm.
- **No upstream** (`joaomjbraga/tocae-reprodutor`): o código do app, na tag da
  versão. É dela que o manifest busca o fonte, com `type: git`.

O manifest em `io.github.joaomjbraga.tocae-reprodutor.yaml` é o mesmo nos dois
lugares: no upstream ele serve para build local, e copiado para o repositório
do Flathub vira o manifest da submissão.

## Arquivos da submissão

Todos ficam na **raiz** do repositório do app no Flathub:

| Arquivo | Origem |
|---|---|
| `io.github.joaomjbraga.tocae-reprodutor.yaml` | manifest |
| `io.github.joaomjbraga.tocae-reprodutor.metainfo.xml` | metadados AppStream |
| `io.github.joaomjbraga.tocae-reprodutor.desktop` | desktop file |
| `io.github.joaomjbraga.tocae-reprodutor.png` | ícone 256×256 |
| `generated-sources.json` | dependências do npm como fontes offline |
| `LICENSE` | licença |

O conjunto completo já está em `~/flathub-submission/` e foi buildado a partir
dali para confirmar que é autossuficiente.

## Antes de submeter

1. **Publicar a tag.** O manifest aponta para `tag: v0.0.3` com o commit
   fixado. Ao publicar uma versão nova, troque os dois campos e atualize o
   `<release>` no metainfo.

   ```sh
   git tag -a v0.0.4 -m "..." && git push origin v0.0.4
   ```

2. **Atualizar a versão do Electron no manifest.** A URL e o `sha256` do zip
   do Electron estão fixados no manifest. Ao atualizar o Electron no
   `package.json`, troque os dois campos (e o nome do zip em `electron-dist`).

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
linter (`flathub/flatpak-builder-lint`, arquivo `exceptions.json`):

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

```sh
# 1. Fork e branch de submissão
gh repo fork flathub/flathub --clone --remote=false
git clone --branch=new-pr git@github.com:<seu-usuario>/flathub.git
cd flathub && git checkout --track origin/new-pr

# 2. Copiar os arquivos da submissão para a raiz
cp ~/flathub-submission/* .

# 3. Commit e push
git add .
git commit -m "Add io.github.joaomjbraga.tocae-reprodutor"
git push origin new-pr

# 4. Abrir o PR contra a branch new-pr
gh pr create --base new-pr --title "Add io.github.joaomjbraga.tocae-reprodutor" --body "..."
```

Depois de mergear, comente `bot, build` no PR para gerar o build de teste.

Detalhes: <https://docs.flathub.org/docs/for-app-authors/submission>
