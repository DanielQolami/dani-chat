# dani-chat

Chat page, created with vue 3 in vite 5.
(UI is inspired by telegram web)

I have made this chat for the company I'm working in. But for the purposes of making the code public, I have removed all the "url"s in the project, so that anyone can use the code and/or improve this code.

### hints:
the folders and files are structured in a way that you can easily start using.

the codes inside the "useChat" composable, are written in a way that they can be used in other codebases (like vanilla javascript, react, svelte & ...).

with a little bit knowledge of Vue.js, you can change & use the codes inside vue components in your own codebase. 

### how it works

when entering the page, an api is called to fetch the chatlist of the current user. then it shows them to the user.
by clicking on the chat, the chat ID is set in the url. by watching the url, we set the current Chat to that ID & fetch the previous messages.

in the meanwhile the socket listens to the new messages and appends them to the chatList.

the socket is written in pure javascript and no library is used for it.

#### technologies used:
Vue 3 - Vite 5 - Pinia - VueUse - Vuetify - Vue-i18n - Axios - Vue-toastification - Typescript

##### responsive UI:
Yes, it is responsive.
##### rtl:
it is considered, but the internet standard is not to use. (to use, you can set [dir="rtl"] on the html tag)

#### hope you enjoy this project



## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
