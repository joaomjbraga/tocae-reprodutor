import type { Messages } from './pt-BR'

export const enMessages: Messages = {
  // Top bar
  'appbar.openVideos': 'Open videos',
  'appbar.openVideosTitle': 'Open videos (Ctrl+O)',
  'appbar.togglePlaylist': 'Show or hide the playlist',
  'appbar.togglePlaylistTitle': 'Show or hide the playlist (L)',
  'appbar.clearPlaylist': 'Clear playlist',
  'appbar.shortcuts': 'Keyboard shortcuts',
  'appbar.about': 'About Tocaê',

  // Language switching
  'language.button': 'Language',
  'language.menu': 'Select language',
  'language.system': 'Follow system',
  'language.systemHint': 'Use the system language: {locale}',

  // Player
  'player.play': 'Play',
  'player.pause': 'Pause',
  'player.previous': 'Previous video',
  'player.previousTitle': 'Previous video (P)',
  'player.next': 'Next video',
  'player.nextTitle': 'Next video (N)',
  'player.loadingVideo': 'Loading video',
  'player.timeline': 'Video timeline',
  'player.timelineValue': '{current} of {total}',
  'player.unmute': 'Unmute',
  'player.mute': 'Mute',
  'player.fullscreen': 'Fullscreen',
  'player.exitFullscreen': 'Exit fullscreen',
  'player.volume': 'Volume',
  'player.dropHint': 'Open a video or drag it here',
  'player.nowPlaying': 'Playing {current} of {total}: {name}',
  'player.listCleared': 'Playlist cleared',
  'player.undo': 'Undo',
  'player.showList': 'Show playlist',
  'player.showListTitle': 'Show playlist (L)',

  // Playlist
  'playlist.label': 'Playlist',
  'playlist.title': 'Playlist',
  'playlist.hide': 'Hide playlist',
  'playlist.hideTitle': 'Hide playlist (L)',
  'playlist.loading': 'Loading playlist',
  'playlist.empty': 'The playlist is empty. Open videos to play them in sequence.',
  'playlist.clear': 'Clear playlist',
  'playlist.remove': 'Remove {name} from the playlist',
  'playlist.removeTitle': 'Remove from the playlist',
  'playlist.itemTitle': '{name} — Alt+↑ / Alt+↓ to move',
  'playlist.moved': 'Moved to position {position} of {total}.',

  // Errors
  'error.unresolved': 'Could not locate the dragged files.',
  'error.playback': 'Could not play this video.',

  // About
  'about.version': 'Version',
  'about.author': 'Author',
  'about.email': 'Email',
  'about.description': 'Minimalist video player',

  // Shortcuts
  'shortcuts.title': 'Keyboard shortcuts',
  'shortcuts.openVideos': 'Open videos',
  'shortcuts.playPause': 'Play or pause',
  'shortcuts.fullscreen': 'Enter or exit fullscreen',
  'shortcuts.mute': 'Mute or unmute',
  'shortcuts.next': 'Next video in the playlist',
  'shortcuts.previous': 'Previous video in the playlist',
  'shortcuts.toggleList': 'Show or hide the playlist',
  'shortcuts.move': 'Move the focused item in the playlist',
  'shortcuts.key.space': 'Space',

  // Native dialogs
  'dialog.openTitle': 'Open videos',
  'dialog.videosFilter': 'Videos',
  'dialog.allFilesFilter': 'All files',

  // Window titles
  'window.about': 'About Tocaê',
  'window.shortcuts': 'Shortcuts',
}
