/**
 * Catálogo de textos em português (Brasil).
 *
 * É a fonte de verdade das chaves: `MessageKey` é derivado deste objeto e o
 * catálogo em inglês é tipado como `Messages`, então qualquer chave esquecida
 * quebra a compilação em vez de vazar o texto do outro idioma.
 */
export const ptBRMessages = {
  // Barra superior
  'appbar.openVideos': 'Abrir vídeos',
  'appbar.openVideosTitle': 'Abrir vídeos (Ctrl+O)',
  'appbar.togglePlaylist': 'Mostrar ou ocultar a lista de reprodução',
  'appbar.togglePlaylistTitle': 'Mostrar ou ocultar a lista (L)',
  'appbar.clearPlaylist': 'Limpar lista',
  'appbar.shortcuts': 'Atalhos de teclado',
  'appbar.about': 'Sobre o Tocaê',

  // Troca de idioma
  'language.button': 'Idioma',
  'language.menu': 'Selecionar idioma',
  'language.system': 'Seguir o sistema',
  'language.systemHint': 'Usar o idioma do sistema: {locale}',

  // Player
  'player.play': 'Reproduzir',
  'player.pause': 'Pausar',
  'player.previous': 'Vídeo anterior',
  'player.previousTitle': 'Vídeo anterior (P)',
  'player.next': 'Próximo vídeo',
  'player.nextTitle': 'Próximo vídeo (N)',
  'player.loadingVideo': 'Carregando vídeo',
  'player.timeline': 'Linha do tempo do vídeo',
  'player.timelineValue': '{current} de {total}',
  'player.unmute': 'Ativar som',
  'player.mute': 'Silenciar',
  'player.fullscreen': 'Tela cheia',
  'player.exitFullscreen': 'Sair da tela cheia',
  'player.volume': 'Volume',
  'player.dropHint': 'Abra um vídeo ou arraste-o para aqui',
  'player.nowPlaying': 'Tocando {current} de {total}: {name}',
  'player.listCleared': 'Lista limpa',
  'player.undo': 'Desfazer',
  'player.showList': 'Mostrar lista',
  'player.showListTitle': 'Mostrar lista (L)',

  // Lista de reprodução
  'playlist.label': 'Lista de reprodução',
  'playlist.title': 'Lista',
  'playlist.hide': 'Ocultar lista',
  'playlist.hideTitle': 'Ocultar lista (L)',
  'playlist.loading': 'Carregando lista',
  'playlist.empty': 'A lista está vazia. Abra vídeos para tocar em sequência.',
  'playlist.clear': 'Limpar lista',
  'playlist.remove': 'Remover {name} da lista',
  'playlist.removeTitle': 'Remover da lista',
  'playlist.itemTitle': '{name} — Alt+↑ / Alt+↓ para mover',
  'playlist.moved': 'Movido para a posição {position} de {total}.',

  // Erros
  'error.unresolved': 'Não foi possível localizar os arquivos arrastados.',
  'error.playback': 'Não foi possível reproduzir este vídeo.',

  // Sobre
  'about.version': 'Versão',
  'about.author': 'Autor',
  'about.email': 'E-mail',
  'about.description': 'Reprodutor de vídeo minimalista',

  // Atalhos
  'shortcuts.title': 'Atalhos de teclado',
  'shortcuts.openVideos': 'Abrir vídeos',
  'shortcuts.playPause': 'Reproduzir ou pausar',
  'shortcuts.fullscreen': 'Entrar ou sair da tela cheia',
  'shortcuts.mute': 'Silenciar ou ativar o som',
  'shortcuts.next': 'Próximo vídeo da lista',
  'shortcuts.previous': 'Vídeo anterior da lista',
  'shortcuts.toggleList': 'Mostrar ou ocultar a lista',
  'shortcuts.move': 'Mover o item focado na lista',
  'shortcuts.key.space': 'Espaço',

  // Diálogos nativos
  'dialog.openTitle': 'Abrir vídeos',
  'dialog.videosFilter': 'Vídeos',
  'dialog.allFilesFilter': 'Todos os arquivos',

  // Títulos das janelas
  'window.about': 'Sobre o Tocaê',
  'window.shortcuts': 'Atalhos',
} as const

export type MessageKey = keyof typeof ptBRMessages

export type Messages = Record<MessageKey, string>
