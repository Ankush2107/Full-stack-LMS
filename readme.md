# Learning Management System

### Setup instruction

1. Clone the project

```
git clone https://github.com/Ankush2107/Full-stack-LMS.git
```

2. Move into the directory

```
cd client
```

3. install dependencies

```
npm install
```

4. run the server

```
npm run dev
```

### setup instruction for tailwind CSS

[Tailwind official instruction doc](https://tailwindcss.com/docs/installation)

1. install tailwindcss

```
npm install -D tailwindcss postcss autoprefixer
```

2. Create tailwind config file

```
npx tailwindcss init -p
```

3. Add file extension to tailwind config file in the content property.

```
"./index.html", "./src/**/*.{html,js,jsx,tx,tsx}"
```

4. Add the tailwind directives in `index.css` file.

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. Add the following details in the plugin property of tailwind config.

```
[require("daisyui"), require("@tailwindcss/line-clamp")]
```

### Adding plugins and dependencies

```
npm install @reduxjs/toolkit react-redux react-router-dom react-icons react-chartjs-2 chart.js daisyui@latest axios react-hot-toast @tailwindcss/line-clamp
```

### configure auto import sort eslint

1. install simple import sort

```
npm i -D eslint-plugin-simple-import-sort
```

2. Add rule in `.eslintrc.cjs`

```
'simple-import-sort/imports': 'error',
```

3. Add simple-import-sort plugins in `.eslintrc.cjs` 

```
plugins: [..., 'simple-import-sort'],
```

4. To import auto import sort on file save in vscode.

    - Open `settings.json`
    - add the following  config
```
"editor.codeActionsOnSave":{
        "source.fixAll.eslint": true 
}
```