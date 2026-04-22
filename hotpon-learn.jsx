import { useState, useRef, useEffect } from "react";

// ─── XP / Progress storage (in-memory) ───────────────────────────────────────
const INITIAL_STATE = { xp: 0, completedLessons: [], streak: 1 };

// ─── Lessons Data ─────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: "basics",
    title: "Основы Hotpon",
    icon: "🔥",
    color: "#ff6b35",
    lessons: [
      {
        id: "basics_1",
        title: "Первая программа",
        xp: 15,
        steps: [
          { type: "explain", title: "Добро пожаловать в Hotpon!", text: "Hotpon — это язык программирования, на котором ты можешь создавать рисовалки, диалоги, календари и даже свой браузер!\n\nКаждая программа на Hotpon начинается и заканчивается специальными командами.", icon: "🔥" },
          { type: "explain", title: "Структура программы", text: "Любая программа на Hotpon выглядит так:\n\nHotpon = start\n\n  [твой код здесь]\n\nHotpon = stop\n\nБез start и stop программа не запустится!", icon: "📋", highlight: "Hotpon = start\n\nHotpon = stop" },
          { type: "explain", title: "Первая команда", text: "Чтобы показать текст на экране, используй:\n\nна экране [твой текст]\n\nТекст нужно писать в квадратных скобках!", icon: "💬", highlight: "на экране [Привет мир!]" },
          { type: "write", title: "Напиши сам!", prompt: "Напиши программу которая выводит 'Привет мир!'", hint: "Не забудь Hotpon = start и Hotpon = stop", answer: "Hotpon = start\n\nна экране [Привет мир!]\n\nHotpon = stop", checkLines: ["hotpon = start", "на экране [привет мир!]", "hotpon = stop"] },
          { type: "quiz", title: "Проверь себя", question: "Как правильно вывести текст на экран?", options: ["показать [текст]", "на экране [текст]", "print(текст)", "вывод = текст"], correct: 1 },
        ]
      },
      {
        id: "basics_2",
        title: "Несколько строк",
        xp: 20,
        steps: [
          { type: "explain", title: "Несколько команд", text: "Ты можешь писать несколько команд подряд — они выполняются по порядку, сверху вниз.", icon: "📜", highlight: "на экране [Строка 1]\nна экране [Строка 2]\nна экране [Строка 3]" },
          { type: "explain", title: "Цикл", text: "Если нужно повторять программу снова и снова, используй:\n\nHotpon = stop + start\n\nвместо обычного stop!", icon: "🔄", highlight: "Hotpon = stop + start" },
          { type: "write", title: "Три строки!", prompt: "Напиши программу которая выводит:\n'Раз'\n'Два'\n'Три'", hint: "Используй три команды на экране", answer: "Hotpon = start\n\nна экране [Раз]\nна экране [Два]\nна экране [Три]\n\nHotpon = stop", checkLines: ["на экране [раз]", "на экране [два]", "на экране [три]"] },
          { type: "quiz", title: "Вопрос!", question: "Что делает 'Hotpon = stop + start'?", options: ["Останавливает программу", "Перезапускает программу в цикле", "Создаёт две программы", "Ничего не делает"], correct: 1 },
        ]
      },
      {
        id: "basics_3",
        title: "Переменные",
        xp: 25,
        steps: [
          { type: "explain", title: "Что такое переменная?", text: "Переменная — это ячейка памяти с именем. Туда можно сохранить любое значение и потом использовать.\n\nВ Hotpon переменные пишутся в фигурных скобках: {имя}", icon: "📦", highlight: "{имя}\n{возраст}\n{цвет}" },
          { type: "explain", title: "Ввод пользователя", text: "Чтобы попросить пользователя ввести что-то и сохранить в переменную:", icon: "⌨️", highlight: "Ввод пользователя {имя}" },
          { type: "explain", title: "Вывод переменной", text: "Чтобы показать значение переменной на экране:", icon: "👁️", highlight: "на экране {имя}" },
          { type: "write", title: "Спроси имя!", prompt: "Напиши программу:\n1. Спроси 'Как тебя зовут?'\n2. Сохрани ответ в переменную {имя}\n3. Выведи {имя}", hint: "на экране [...] → Ввод пользователя {имя} → на экране {имя}", answer: "Hotpon = start\n\nна экране [Как тебя зовут?]\nВвод пользователя {имя}\nна экране {имя}\n\nHotpon = stop", checkLines: ["ввод пользователя {имя}", "на экране {имя}"] },
          { type: "quiz", title: "Переменные!", question: "Как записывается переменная 'возраст' в Hotpon?", options: ["(возраст)", "[возраст]", "{возраст}", "$возраст"], correct: 2 },
        ]
      },
    ]
  },
  {
    id: "dialog",
    title: "Диалоги",
    icon: "💬",
    color: "#3b82f6",
    lessons: [
      {
        id: "dialog_1",
        title: "Первый диалог",
        xp: 20,
        steps: [
          { type: "explain", title: "Технология диалог", text: "Диалоги — это способ показывать сообщения по одному, как в мессенджере!\n\nСначала нужно подключить технологию:", icon: "💬", highlight: "Технология диалог" },
          { type: "explain", title: "Блок диалога", text: "После подключения технологии создай блок диалога:", icon: "📝", highlight: "Диалог = технология диалог\nНа экране [Привет!]\nПосле команды dale\nНа экране [Как дела?]" },
          { type: "explain", title: "Команда dale", text: "В игре ты пишешь dale в консоль, чтобы перейти к следующему сообщению.\n\nКак листание страниц книги!", icon: "➡️", highlight: "После команды dale" },
          { type: "write", title: "Создай диалог!", prompt: "Напиши диалог из 2 сообщений:\n'Привет!'\n'Добро пожаловать в Hotpon!'", hint: "Не забудь Технология диалог и После команды dale", answer: "Hotpon = start\n\nТехнология диалог\n\nДиалог = технология диалог\nНа экране [Привет!]\nПосле команды dale\nНа экране [Добро пожаловать в Hotpon!]\n\nHotpon = stop", checkLines: ["технология диалог", "диалог = технология диалог", "на экране [привет!]", "после команды dale"] },
          { type: "quiz", question: "Что нужно написать в игре чтобы перейти к следующему сообщению?", options: ["next", "dale", "enter", "продолжить"], correct: 1, title: "Команда dale" },
        ]
      },
      {
        id: "dialog_2",
        title: "Длинный диалог",
        xp: 25,
        steps: [
          { type: "explain", title: "Много сообщений", text: "Диалог может содержать сколько угодно сообщений! Каждое разделяется командой 'После команды dale'", icon: "💬", highlight: "На экране [Сообщение 1]\nПосле команды dale\nНа экране [Сообщение 2]\nПосле команды dale\nНа экране [Сообщение 3]" },
          { type: "write", title: "Диалог из 3 частей!", prompt: "Создай диалог:\n'Ты готов учиться?'\n'Отлично!'\n'Начнём!'", hint: "Два 'После команды dale' между тремя сообщениями", answer: "Hotpon = start\n\nТехнология диалог\n\nДиалог = технология диалог\nНа экране [Ты готов учиться?]\nПосле команды dale\nНа экране [Отлично!]\nПосле команды dale\nНа экране [Начнём!]\n\nHotpon = stop", checkLines: ["на экране [ты готов учиться?]", "после команды dale", "на экране [отлично!]", "на экране [начнём!]"] },
          { type: "quiz", question: "Сколько 'После команды dale' нужно для 4 сообщений?", options: ["2", "3", "4", "5"], correct: 1, title: "Считаем dale" },
        ]
      },
    ]
  },
  {
    id: "drawing",
    title: "Рисовалка",
    icon: "🎨",
    color: "#22c55e",
    lessons: [
      {
        id: "draw_1",
        title: "Первый холст",
        xp: 20,
        steps: [
          { type: "explain", title: "Технология холст", text: "Для рисования нужны три технологии:\n\nТехнология холст — сам холст\nТехнология карандаш — инструмент рисования\nТехнология ластик — для исправлений", icon: "🎨", highlight: "Технология карандаш\nТехнология ластик\nТехнология холст" },
          { type: "explain", title: "Цвета", text: "Добавь кнопки цветов командой [Цвета]:", icon: "🌈", highlight: "[Цвета]{красный [Кнопка]} {синий [Кнопка]} {радужный [Кнопка]}" },
          { type: "explain", title: "Настройки холста", text: "Можно настроить цвет фона и размер:\n\nЦвет холста = [белый]\nРазмер холста = [большой]", icon: "⚙️", highlight: "Цвет холста = [белый]\nРазмер холста = [большой]" },
          { type: "write", title: "Создай рисовалку!", prompt: "Напиши программу рисовалки с:\n- карандашом и ластиком\n- цветами: красный, синий, зелёный\n- белым холстом", hint: "Три Технологии + [Цвета] + Цвет холста", answer: "Hotpon = start\n\nТехнология карандаш\nТехнология ластик\nТехнология холст\n\n[Цвета]{красный [Кнопка]} {синий [Кнопка]} {зеленый [Кнопка]}\nЦвет холста = [белый]\n\nHotpon = stop", checkLines: ["технология карандаш", "технология ластик", "технология холст", "[цвета]"] },
          { type: "quiz", question: "Какой командой добавить кнопку цвета?", options: ["{красный}", "[красный Кнопка]", "{красный [Кнопка]}", "цвет = красный"], correct: 2, title: "Кнопки цветов" },
        ]
      },
      {
        id: "draw_2",
        title: "Радужная кисть",
        xp: 15,
        steps: [
          { type: "explain", title: "Радужный цвет!", text: "В Hotpon есть специальный цвет — радужный! Он рисует переливающимися цветами радуги 🌈", icon: "🌈", highlight: "{радужный [Кнопка]}" },
          { type: "write", title: "Добавь радугу!", prompt: "Создай рисовалку с радужной кистью и ещё двумя цветами на выбор", hint: "Добавь {радужный [Кнопка]} в список цветов", answer: "Hotpon = start\n\nТехнология карандаш\nТехнология ластик\nТехнология холст\n\n[Цвета]{радужный [Кнопка]} {красный [Кнопка]} {синий [Кнопка]}\n\nHotpon = stop", checkLines: ["технология холст", "{радужный [кнопка]}"] },
          { type: "quiz", question: "Что делает цвет 'радужный'?", options: ["Рисует радугу на небе", "Переливается всеми цветами", "Стирает рисунок", "Меняет фон"], correct: 1, title: "Радужный цвет" },
        ]
      },
    ]
  },
  {
    id: "calendar",
    title: "Календарь",
    icon: "📅",
    color: "#a855f7",
    lessons: [
      {
        id: "cal_1",
        title: "Создай календарь",
        xp: 20,
        steps: [
          { type: "explain", title: "Технология календарь", text: "Создаём интерактивный календарь! Можно листать месяцы, добавлять заметки и события.", icon: "📅", highlight: "Технология календарь" },
          { type: "explain", title: "Цвета календаря", text: "Настрой внешний вид:", icon: "🎨", highlight: "Цвет заголовка = [оранжевый]\nЦвет выходных = [красный]\nЦвет сегодня = [оранжевый]\nЦвет дней = [белый]" },
          { type: "explain", title: "События", text: "Добавляй события на конкретные даты:", icon: "📌", highlight: "Событие = [15.5] [День рождения 🎂] [розовый]" },
          { type: "write", title: "Свой календарь!", prompt: "Создай календарь с:\n- радужным заголовком\n- красными выходными\n- одним событием на любой день", hint: "Технология календарь + Цвет заголовка = [радужный] + Событие", answer: "Hotpon = start\n\nТехнология календарь\n\nЦвет заголовка = [радужный]\nЦвет выходных = [красный]\nЦвет сегодня = [оранжевый]\nЦвет дней = [белый]\n\nСобытие = [1.6] [Мой праздник!] [оранжевый]\n\nHotpon = stop", checkLines: ["технология календарь", "цвет заголовка", "событие ="] },
          { type: "quiz", question: "Как записать событие на 25 декабря?", options: ["Событие = [декабрь 25]", "Событие = [25.12] [текст] [цвет]", "Дата = [25/12]", "День = [25] [12]"], correct: 1, title: "Формат даты" },
        ]
      },
    ]
  },
  {
    id: "browser",
    title: "Браузер",
    icon: "🌐",
    color: "#06b6d4",
    lessons: [
      {
        id: "browser_1",
        title: "Свой браузер",
        xp: 25,
        steps: [
          { type: "explain", title: "Технология браузер", text: "Создай свой мини-интернет! Ты пишешь страницы на Hotpon коде, и браузер их отображает.", icon: "🌐", highlight: "Технология браузер\nБраузер = домашняя страница [home]\nБраузер закладка = [🏠 Главная] [home]" },
          { type: "explain", title: "Файлы страниц", text: "Страницы создаются в отдельных файлах с расширением .страница:\n\nhome.страница\nnews.страница\nabout.страница", icon: "📄", highlight: "home.страница" },
          { type: "explain", title: "Структура страницы", text: "Каждая страница начинается с ID:", icon: "📝", highlight: "Страница = home\nЗаголовок = [Моя страница]\nЦвет акцента = [радужный]\nТекст = [Привет!]\nКнопка = [Далее] [about] [оранжевый]" },
          { type: "quiz", question: "Какое расширение у файла страницы?", options: [".html", ".hot", ".страница", ".page"], correct: 2, title: "Файлы страниц" },
          { type: "quiz", question: "Как сделать переход на страницу 'about' по кнопке?", options: ["Ссылка = [about]", "Кнопка = [текст] [about] [цвет]", "Перейти [about]", "Браузер = открыть [about]"], correct: 1, title: "Кнопки-ссылки" },
        ]
      },
    ]
  },
];

// ─── Ready-made code snippets ─────────────────────────────────────────────────
const SNIPPETS = [
  {
    category: "Основы",
    icon: "🔥",
    color: "#ff6b35",
    items: [
      { title: "Привет мир", desc: "Первая программа на Hotpon", code: `Hotpon = start\n\nна экране [Привет, мир! 🔥]\n\nHotpon = stop` },
      { title: "Ввод имени", desc: "Спросить имя и вывести", code: `Hotpon = start\n\nна экране [Как тебя зовут?]\nВвод пользователя {имя}\nна экране {имя}\n\nHotpon = stop` },
      { title: "Цикл", desc: "Бесконечный повтор", code: `Hotpon = start\n\nна экране [Эта программа работает всегда!]\n\nHotpon = stop + start` },
    ]
  },
  {
    category: "Диалог",
    icon: "💬",
    color: "#3b82f6",
    items: [
      { title: "Простой диалог", desc: "2 сообщения с dale", code: `Hotpon = start\n\nТехнология диалог\n\nДиалог = технология диалог\nНа экране [Привет! Как дела?]\nПосле команды dale\nНа экране [Рад тебя видеть!]\n\nHotpon = stop` },
      { title: "История", desc: "Длинный диалог-история", code: `Hotpon = start\n\nТехнология диалог\n\nДиалог = технология диалог\nНа экране [Давным-давно в одном королевстве...]\nПосле команды dale\nНа экране [Жил-был смелый программист.]\nПосле команды dale\nНа экране [Он создал язык Hotpon 🔥]\nПосле команды dale\nНа экране [И все жили счастливо!]\n\nHotpon = stop` },
    ]
  },
  {
    category: "Рисовалка",
    icon: "🎨",
    color: "#22c55e",
    items: [
      { title: "Базовая рисовалка", desc: "Холст с основными цветами", code: `Hotpon = start\n\nТехнология карандаш\nТехнология ластик\nТехнология холст\n\n[Цвета]{черный [Кнопка]} {красный [Кнопка]} {синий [Кнопка]} {зеленый [Кнопка]}\nЦвет холста = [белый]\n\nHotpon = stop` },
      { title: "Радужная рисовалка", desc: "Со всеми цветами включая радугу", code: `Hotpon = start\n\nТехнология карандаш\nТехнология ластик\nТехнология холст\n\n[Цвета]{радужный [Кнопка]} {черный [Кнопка]} {красный [Кнопка]} {синий [Кнопка]} {зеленый [Кнопка]} {фиолетовый [Кнопка]} {оранжевый [Кнопка]}\nЦвет холста = [белый]\nРазмер холста = [большой]\n\nHotpon = stop` },
    ]
  },
  {
    category: "Календарь",
    icon: "📅",
    color: "#a855f7",
    items: [
      { title: "Простой календарь", desc: "Базовый календарь", code: `Hotpon = start\n\nТехнология календарь\n\nЦвет заголовка = [оранжевый]\nЦвет дней = [белый]\nЦвет выходных = [красный]\nЦвет сегодня = [оранжевый]\n\nHotpon = stop` },
      { title: "Календарь с событиями", desc: "С событиями на разные дни", code: `Hotpon = start\n\nТехнология календарь\n\nЦвет заголовка = [радужный]\nЦвет дней = [белый]\nЦвет выходных = [красный]\nЦвет сегодня = [голубой]\n\nСобытие = [1.1] [Новый год! 🎆] [желтый]\nСобытие = [14.2] [День влюблённых 💕] [розовый]\nСобытие = [8.3] [8 марта 🌷] [зеленый]\n\nHotpon = stop` },
    ]
  },
  {
    category: "Браузер",
    icon: "🌐",
    color: "#06b6d4",
    items: [
      { title: "browser.hot", desc: "Настройки браузера", code: `Hotpon = start\n\nТехнология браузер\n\nБраузер = домашняя страница [home]\nБраузер цвет = [радужный]\nБраузер закладка = [🏠 Главная] [home]\nБраузер закладка = [📖 О нас] [about]\n\nHotpon = stop` },
      { title: "home.страница", desc: "Домашняя страница", code: `Страница = home\nЗаголовок = [🔥 Моя страница!]\nЦвет фона = [тёмный]\nЦвет акцента = [радужный]\nЦвет текста = [белый]\n\nТекст = [Добро пожаловать!]\nТекст = [Это моя первая страница на Hotpon.]\nРазделитель\nКнопка = [Узнать больше →] [about] [оранжевый]` },
      { title: "about.страница", desc: "Страница 'О нас'", code: `Страница = about\nЗаголовок = [📖 О нас]\nЦвет фона = [синий]\nЦвет акцента = [голубой]\nЦвет текста = [белый]\n\nЗаголовок 2 = [Кто мы?]\nТекст = [Мы изучаем язык Hotpon!]\nРазделитель\nКнопка = [← Назад] [home] [голубой]` },
    ]
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function XPBar({ xp, streak }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:18 }}>🔥</span>
        <span style={{ color:"#ff6b35", fontWeight:900, fontSize:14 }}>{streak}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ color:"#ffcc02", fontSize:12, fontWeight:700 }}>Ур. {level}</span>
        <div style={{ width:80, height:6, background:"#1e1e22", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#ff6b35,#ffcc02)", borderRadius:3, transition:"width 0.5s ease" }}/>
        </div>
        <span style={{ color:"#555", fontSize:11 }}>{xp} XP</span>
      </div>
    </div>
  );
}

function LessonCard({ lesson, course, completed, onStart }) {
  return (
    <div onClick={onStart} style={{
      background: completed ? "#0d1a0d" : "#111116",
      border: `1px solid ${completed ? course.color+"44" : "#2a2a30"}`,
      borderRadius: 12, padding: "16px 18px",
      cursor: "pointer", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap:14,
    }}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="none"}
    >
      <div style={{ width:44, height:44, borderRadius:12, background:`${course.color}22`, border:`2px solid ${completed?course.color:"#2a2a30"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
        {completed ? "✓" : course.icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ color: completed ? course.color : "#e8e8f0", fontWeight:700, fontSize:14 }}>{lesson.title}</div>
        <div style={{ color:"#444", fontSize:12, marginTop:2 }}>{lesson.steps.length} шагов · +{lesson.xp} XP</div>
      </div>
      <div style={{ color: completed ? course.color : "#333", fontSize:18 }}>{completed ? "🏆" : "▶"}</div>
    </div>
  );
}

function StepExplain({ step, onNext }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:560, margin:"0 auto" }}>
      <div style={{ fontSize:48, textAlign:"center" }}>{step.icon}</div>
      <h2 style={{ color:"#e8e8f0", fontSize:22, fontWeight:900, textAlign:"center", margin:0 }}>{step.title}</h2>
      <div style={{ color:"#888", fontSize:15, lineHeight:1.7, textAlign:"center", whiteSpace:"pre-line" }}>{step.text}</div>
      {step.highlight && (
        <div style={{ background:"#0a0a0c", border:"1px solid #2a2a30", borderRadius:10, padding:"16px 20px" }}>
          <pre style={{ color:"#ffcc02", fontSize:14, margin:0, fontFamily:"'Courier New',monospace", whiteSpace:"pre-wrap", lineHeight:1.8 }}>{step.highlight}</pre>
        </div>
      )}
      <button onClick={onNext} style={{ background:"linear-gradient(135deg,#ff6b35,#ff9f1c)", border:"none", borderRadius:12, color:"#000", fontWeight:900, fontSize:16, padding:"14px 40px", cursor:"pointer", fontFamily:"'Courier New',monospace", alignSelf:"center" }}>
        Понятно! →
      </button>
    </div>
  );
}

function StepQuiz({ step, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const handle = (i) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    setTimeout(() => { if (i === step.correct) onCorrect(); else onWrong(); }, 800);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:560, margin:"0 auto" }}>
      <div style={{ fontSize:40, textAlign:"center" }}>❓</div>
      <h2 style={{ color:"#e8e8f0", fontSize:20, fontWeight:900, textAlign:"center", margin:0 }}>{step.question}</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {step.options.map((opt, i) => {
          let bg="#111116", border="#2a2a30", color="#e8e8f0";
          if (answered) {
            if (i === step.correct) { bg="#0d1a0d"; border="#22c55e"; color="#22c55e"; }
            else if (i === selected && i !== step.correct) { bg="#1a0d0d"; border="#ef4444"; color="#ef4444"; }
          } else if (selected===i) { bg="#1a1520"; border="#ff6b35"; color="#ff6b35"; }
          return (
            <button key={i} onClick={()=>handle(i)} style={{ background:bg, border:`2px solid ${border}`, borderRadius:10, color, fontWeight:700, fontSize:14, padding:"14px 20px", cursor:"pointer", fontFamily:"'Courier New',monospace", textAlign:"left", transition:"all 0.15s" }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepWrite({ step, onCorrect, onWrong }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // null | "ok" | "err"
  const check = () => {
    const lower = code.toLowerCase().replace(/\s+/g," ");
    const allMatch = step.checkLines.every(line => lower.includes(line.toLowerCase()));
    if (allMatch) { setResult("ok"); setTimeout(onCorrect, 800); }
    else { setResult("err"); setTimeout(()=>setResult(null), 1200); }
  };
  const showAnswer = () => { setCode(step.answer); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:580, margin:"0 auto", width:"100%" }}>
      <div style={{ fontSize:36, textAlign:"center" }}>✍️</div>
      <h2 style={{ color:"#e8e8f0", fontSize:18, fontWeight:900, textAlign:"center", margin:0 }}>{step.title}</h2>
      <div style={{ color:"#888", fontSize:14, textAlign:"center", whiteSpace:"pre-line" }}>{step.prompt}</div>
      {step.hint && <div style={{ background:"#1a1520", border:"1px solid #ff6b3533", borderRadius:8, padding:"8px 14px", color:"#ff6b35", fontSize:12 }}>💡 {step.hint}</div>}
      <textarea
        value={code}
        onChange={e=>setCode(e.target.value)}
        spellCheck={false}
        placeholder="Напиши код здесь..."
        style={{
          background: result==="ok"?"#0d1a0d":result==="err"?"#1a0d0d":"#0a0a0c",
          border: `1px solid ${result==="ok"?"#22c55e":result==="err"?"#ef4444":"#2a2a30"}`,
          borderRadius:10, color:"#e8e8f0", fontSize:14, lineHeight:1.7,
          padding:"14px 16px", outline:"none", resize:"vertical", minHeight:140,
          fontFamily:"'Courier New',monospace", transition:"all 0.2s",
        }}
      />
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={check} style={{ flex:1, background:"linear-gradient(135deg,#ff6b35,#ff9f1c)", border:"none", borderRadius:10, color:"#000", fontWeight:900, fontSize:15, padding:"13px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>
          {result==="ok"?"✓ Верно!":result==="err"?"✗ Попробуй ещё":"Проверить"}
        </button>
        <button onClick={showAnswer} style={{ background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:10, color:"#555", fontSize:13, padding:"13px 16px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>
          Подсказка
        </button>
      </div>
    </div>
  );
}

function LessonModal({ lesson, course, onClose, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const step = lesson.steps[stepIdx];
  const progress = ((stepIdx) / lesson.steps.length) * 100;

  const next = () => {
    if (stepIdx < lesson.steps.length - 1) { setStepIdx(s=>s+1); setXpEarned(x=>x+3); }
    else finish();
  };
  const wrong = () => {
    setLives(l=>Math.max(0,l-1));
    setStepIdx(s=>s); // stay
  };
  const finish = () => { setFinished(true); onComplete(lesson.xp); };

  if (finished) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
      <div style={{ background:"#111114", border:`2px solid ${course.color}`, borderRadius:20, padding:"48px 40px", textAlign:"center", maxWidth:380, animation:"slideUp 0.3s ease" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏆</div>
        <h2 style={{ color:course.color, fontSize:28, fontWeight:900, margin:"0 0 8px" }}>Урок завершён!</h2>
        <div style={{ color:"#555", fontSize:15, marginBottom:24 }}>{lesson.title}</div>
        <div style={{ background:"#0a0a0c", borderRadius:12, padding:"16px", marginBottom:24 }}>
          <div style={{ color:"#ffcc02", fontSize:32, fontWeight:900 }}>+{lesson.xp} XP</div>
          <div style={{ color:"#444", fontSize:12, marginTop:4 }}>получено очков</div>
        </div>
        <button onClick={onClose} style={{ background:`linear-gradient(135deg,${course.color},#ff9f1c)`, border:"none", borderRadius:12, color:"#000", fontWeight:900, fontSize:16, padding:"14px 40px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>
          Продолжить 🔥
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column", zIndex:999 }}>
      {/* Header */}
      <div style={{ background:"#0d0d0f", borderBottom:"1px solid #1e1e22", padding:"12px 20px", display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#444", fontSize:20, cursor:"pointer" }}>✕</button>
        {/* Progress bar */}
        <div style={{ flex:1, height:8, background:"#1e1e22", borderRadius:4, overflow:"hidden" }}>
          <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg,${course.color},#ff9f1c)`, borderRadius:4, transition:"width 0.4s ease" }}/>
        </div>
        {/* Lives */}
        <div style={{ display:"flex", gap:4 }}>
          {[0,1,2].map(i=><span key={i} style={{ fontSize:16, opacity:i<lives?1:0.2 }}>❤️</span>)}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex:1, overflowY:"auto", padding:"32px 20px", display:"flex", alignItems:"flex-start", justifyContent:"center" }}>
        {step.type==="explain" && <StepExplain step={step} onNext={next}/>}
        {step.type==="quiz"    && <StepQuiz step={step} onCorrect={next} onWrong={wrong}/>}
        {step.type==="write"   && <StepWrite step={step} onCorrect={next} onWrong={wrong}/>}
      </div>

      {/* Step counter */}
      <div style={{ padding:"8px 20px", textAlign:"center", color:"#2a2a30", fontSize:12, flexShrink:0 }}>
        {stepIdx+1} / {lesson.steps.length}
      </div>
    </div>
  );
}

function SnippetCard({ item, color }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(item.code).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 1500);
  };
  return (
    <div style={{ background:"#111116", border:"1px solid #2a2a30", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #1e1e22" }}>
        <div>
          <div style={{ color:"#e8e8f0", fontWeight:700, fontSize:13 }}>{item.title}</div>
          <div style={{ color:"#444", fontSize:11, marginTop:2 }}>{item.desc}</div>
        </div>
        <button onClick={copy} style={{ background:copied?`${color}22`:"#1a1a1f", border:`1px solid ${copied?color:"#2a2a30"}`, borderRadius:7, color:copied?color:"#888", fontSize:11, padding:"6px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace", transition:"all 0.2s", flexShrink:0 }}>
          {copied?"✓ Скопировано":"📋 Копировать"}
        </button>
      </div>
      <pre style={{ margin:0, padding:"14px 16px", background:"#0a0a0c", color:"#888", fontSize:11, fontFamily:"'Courier New',monospace", overflowX:"auto", lineHeight:1.7, whiteSpace:"pre" }}>{item.code}</pre>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HotponLearn() {
  const [tab, setTab] = useState("lessons"); // "lessons" | "snippets"
  const [state, setState] = useState(INITIAL_STATE);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [snippetCat, setSnippetCat] = useState(0);

  const completeLesson = (lessonId, xp) => {
    setState(s => ({
      ...s,
      xp: s.xp + xp,
      completedLessons: s.completedLessons.includes(lessonId) ? s.completedLessons : [...s.completedLessons, lessonId],
      streak: s.streak,
    }));
  };

  const totalLessons = COURSES.reduce((a,c)=>a+c.lessons.length,0);
  const doneCount = state.completedLessons.length;

  return (
    <div style={{ minHeight:"100vh", background:"#080809", fontFamily:"'Courier New',monospace", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"#0d0d0f", borderBottom:"1px solid #1e1e22", padding:"12px 20px", display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
        <div style={{ fontSize:22, fontWeight:900, background:"linear-gradient(135deg,#ff6b35,#ffcc02)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>🔥 Hotpon Learn</div>
        <div style={{ marginLeft:"auto" }}><XPBar xp={state.xp} streak={state.streak}/></div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#0d0d0f", borderBottom:"1px solid #1e1e22", display:"flex", padding:"0 20px" }}>
        {[["lessons","📚 Уроки"],["snippets","📋 Готовый код"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ background:"none", border:"none", borderBottom:`2px solid ${tab===id?"#ff6b35":"transparent"}`, color:tab===id?"#e8e8f0":"#444", fontWeight:700, fontSize:13, padding:"14px 20px", cursor:"pointer", fontFamily:"'Courier New',monospace", transition:"all 0.15s" }}>{label}</button>
        ))}
        {/* Progress summary */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:80, height:4, background:"#1e1e22", borderRadius:2, overflow:"hidden" }}>
            <div style={{ width:`${(doneCount/totalLessons)*100}%`, height:"100%", background:"linear-gradient(90deg,#ff6b35,#ffcc02)", borderRadius:2 }}/>
          </div>
          <span style={{ color:"#444", fontSize:11 }}>{doneCount}/{totalLessons}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", maxWidth:700, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ── LESSONS TAB ── */}
        {tab==="lessons" && !activeCourse && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ color:"#333", fontSize:13, marginBottom:4 }}>Выбери курс чтобы начать:</div>
            {COURSES.map(course=>{
              const done = course.lessons.filter(l=>state.completedLessons.includes(l.id)).length;
              const pct = Math.round((done/course.lessons.length)*100);
              return(
                <div key={course.id} onClick={()=>setActiveCourse(course)} style={{ background:"#111114", border:`1px solid ${done===course.lessons.length?course.color+"44":"#2a2a30"}`, borderRadius:14, padding:"18px 20px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:16 }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=course.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=done===course.lessons.length?course.color+"44":"#2a2a30"}
                >
                  <div style={{ width:52, height:52, borderRadius:14, background:`${course.color}22`, border:`2px solid ${course.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{course.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#e8e8f0", fontWeight:900, fontSize:16 }}>{course.title}</div>
                    <div style={{ color:"#444", fontSize:12, marginTop:3 }}>{course.lessons.length} уроков · {done} завершено</div>
                    <div style={{ marginTop:8, height:4, background:"#1e1e22", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:course.color, borderRadius:2, transition:"width 0.5s" }}/>
                    </div>
                  </div>
                  <span style={{ color:course.color, fontSize:20 }}>›</span>
                </div>
              );
            })}
          </div>
        )}

        {tab==="lessons" && activeCourse && (
          <div>
            <button onClick={()=>setActiveCourse(null)} style={{ background:"none", border:"none", color:"#555", fontSize:13, cursor:"pointer", marginBottom:16, display:"flex", alignItems:"center", gap:6, padding:0, fontFamily:"'Courier New',monospace" }}>
              ← Все курсы
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <span style={{ fontSize:28 }}>{activeCourse.icon}</span>
              <div>
                <div style={{ color:"#e8e8f0", fontWeight:900, fontSize:20 }}>{activeCourse.title}</div>
                <div style={{ color:"#444", fontSize:12 }}>{activeCourse.lessons.length} уроков</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {activeCourse.lessons.map(lesson=>(
                <LessonCard key={lesson.id} lesson={lesson} course={activeCourse}
                  completed={state.completedLessons.includes(lesson.id)}
                  onStart={()=>setActiveLesson(lesson)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── SNIPPETS TAB ── */}
        {tab==="snippets" && (
          <div>
            {/* Category tabs */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {SNIPPETS.map((cat,i)=>(
                <button key={i} onClick={()=>setSnippetCat(i)} style={{ background:snippetCat===i?`${cat.color}22`:"#111116", border:`1px solid ${snippetCat===i?cat.color:"#2a2a30"}`, borderRadius:8, color:snippetCat===i?cat.color:"#888", fontSize:12, fontWeight:700, padding:"7px 14px", cursor:"pointer", fontFamily:"'Courier New',monospace", transition:"all 0.15s" }}>
                  {cat.icon} {cat.category}
                </button>
              ))}
            </div>
            {/* Snippets */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {SNIPPETS[snippetCat].items.map((item,i)=>(
                <SnippetCard key={i} item={item} color={SNIPPETS[snippetCat].color}/>
              ))}
            </div>
            <div style={{ marginTop:16, color:"#333", fontSize:12, textAlign:"center" }}>
              Нажми «Копировать» → вставь в Hotpon IDE
            </div>
          </div>
        )}
      </div>

      {/* Lesson modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          course={activeCourse}
          onClose={()=>setActiveLesson(null)}
          onComplete={(xp)=>{ completeLesson(activeLesson.id, xp); setActiveLesson(null); }}
        />
      )}

      <style>{`
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>
    </div>
  );
}
