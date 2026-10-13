# Preview Markdown

Visualizador de Markdown que roda inteiro no navegador. Você cola o texto, abre um arquivo ou arrasta um `.md` para a página, e a prévia formatada aparece ao lado enquanto você digita.

Não tem servidor, login nem banco de dados. O texto nunca sai do seu computador.

## Funcionalidades

- Editor à esquerda e prévia à direita em telas grandes. No celular os dois ficam empilhados.
- Três modos de visualização (Editor, Dividido e Prévia), com animação na troca.
- Abrir arquivo pelo botão ou com Ctrl+O, ou arrastar o arquivo para qualquer parte da página.
- Suporte a GitHub Flavored Markdown: tabelas, checklists, texto riscado e blocos de código.
- Contador de palavras, caracteres e tempo estimado de leitura.
- 15 temas prontos, entre eles GitHub claro e escuro, Nord, Dracula, Solarized, Sépia e Jornal.
- Criador de temas: você escolhe cores, fontes, tamanho do texto e espaçamento, vê o resultado na hora e o app avisa se o contraste ficou baixo. Temas criados podem ser editados, duplicados e excluídos. Os nativos ficam protegidos.

Tema escolhido, temas criados, último texto e modo de visualização ficam salvos no `localStorage`. Se o navegador bloquear o armazenamento, o app continua funcionando e só perde os dados ao fechar a aba.

## Como rodar

Precisa do Node.js 18 ou mais recente.

```bash
npm install
npm run dev
```

Depois abra http://localhost:5173.

Outros comandos:

```bash
npm test          # roda os testes (Vitest)
npm run build     # gera a versão final em dist/
npm run preview   # serve o conteúdo de dist/ localmente
```

A pasta `dist/` é estática e pode ser publicada em qualquer hospedagem de arquivos, como GitHub Pages, Netlify ou Vercel.

## Atalhos

| Atalho | Ação |
| --- | --- |
| Ctrl+O | Abrir arquivo |
| Ctrl+Shift+P | Alternar entre Editor, Dividido e Prévia |
| Tab | Indentar no editor |
| Esc | Sair do editor e ir para a prévia |
| Setas | Trocar o modo quando o seletor está em foco |

## Segurança

O Markdown é convertido com [marked](https://marked.js.org/) e o HTML resultante passa pelo [DOMPurify](https://github.com/cure53/DOMPurify) antes de ir para a tela. Scripts, iframes, formulários, atributos `on*` e links `javascript:` são removidos. A página também define uma Content Security Policy que só aceita scripts do próprio site.

Imagens com endereço externo dentro do Markdown são carregadas normalmente, já que é o próprio navegador que as busca.

## Acessibilidade

Os botões têm área mínima de 44px, rótulos lidos por leitores de tela e foco bem visível. A troca de modo é anunciada para leitores de tela. As animações são desligadas quando o sistema pede movimento reduzido, e o modo de alto contraste do Windows é respeitado.

A interface usa SF Pro em aparelhos Apple. Nos outros sistemas usa Inter, que vem junto com o projeto e funciona offline.

## Estrutura

```
index.html          layout e diálogos
src/main.js         editor, arquivos, modos de visualização e temas
src/markdown.js     renderização segura e validação de arquivos
src/themes.js       temas nativos e normalização de temas personalizados
src/storage.js      localStorage com fallback em memória
src/style.css       interface e estilos da prévia
tests/              testes com Vitest
```
