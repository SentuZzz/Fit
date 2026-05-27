const CLIENTS=[
{id:1,first:"Елена",last:"Волкова",email:"elena.v@mail.ru",phone:"+7 905-111-01-01",balance:8500,sub:"Премиум",status:"Активен"},
{id:2,first:"Дмитрий",last:"Ли",email:"dmitry.l@mail.ru",phone:"+7 905-111-01-02",balance:3200,sub:"Базовый",status:"Активен"},
{id:3,first:"София",last:"Чен",email:"sofia.c@mail.ru",phone:"+7 905-111-01-03",balance:0,sub:"Годовой VIP",status:"Активен"},
{id:4,first:"Артём",last:"Бруков",email:"artem.b@mail.ru",phone:"+7 905-111-01-04",balance:1500,sub:"Базовый",status:"Истёк"},
{id:5,first:"Ольга",last:"Гарсия",email:"olga.g@mail.ru",phone:"+7 905-111-01-05",balance:12000,sub:"Премиум",status:"Активен"},
{id:6,first:"Максим",last:"Мартинов",email:"max.m@mail.ru",phone:"+7 905-111-01-06",balance:0,sub:"Нет",status:"Ожидание"},
{id:7,first:"Анна",last:"Жукова",email:"anna.z@mail.ru",phone:"+7 905-111-01-07",balance:4700,sub:"Студенческий",status:"Активен"},
{id:8,first:"Николай",last:"Давыдов",email:"nik.d@mail.ru",phone:"+7 905-111-01-08",balance:500,sub:"Базовый",status:"Истёк"},
{id:9,first:"Мария",last:"Андреева",email:"maria.a@mail.ru",phone:"+7 905-111-01-09",balance:9800,sub:"Годовой VIP",status:"Активен"},
{id:10,first:"Егор",last:"Тарасов",email:"egor.t@mail.ru",phone:"+7 905-111-01-10",balance:5600,sub:"Премиум",status:"Активен"}
];

const SUB_TYPES=[
{name:"Базовый",price:2999,duration:"1 месяц",features:["Доступ в тренажёрный зал","Раздевалка","2 групповых занятия/нед."]},
{name:"Премиум",price:5999,duration:"1 месяц",features:["Полный доступ","Все групповые занятия","Сауна и бассейн","1 персональная тренировка/мес."]},
{name:"Годовой VIP",price:49999,duration:"12 месяцев",features:["Безлимитный доступ","Приоритетная запись","Консультация нутрициолога","4 персональных тренировки/мес."]},
{name:"Студенческий",price:1999,duration:"1 месяц",features:["Доступ в тренажёрный зал","Непиковые часы","1 групповое занятие/нед."]}
];

const CLIENT_SUBS=[
{client:"Елена Волкова",plan:"Премиум",start:"01.04.2026",end:"01.05.2026",status:"Активен"},
{client:"Дмитрий Ли",plan:"Базовый",start:"15.04.2026",end:"15.05.2026",status:"Активен"},
{client:"София Чен",plan:"Годовой VIP",start:"01.01.2026",end:"01.01.2027",status:"Активен"},
{client:"Артём Бруков",plan:"Базовый",start:"01.02.2026",end:"01.03.2026",status:"Истёк"},
{client:"Ольга Гарсия",plan:"Премиум",start:"10.04.2026",end:"10.05.2026",status:"Активен"},
{client:"Анна Жукова",plan:"Студенческий",start:"20.03.2026",end:"20.04.2026",status:"Истёк"},
{client:"Мария Андреева",plan:"Годовой VIP",start:"15.02.2026",end:"15.02.2027",status:"Активен"},
{client:"Егор Тарасов",plan:"Премиум",start:"05.04.2026",end:"05.05.2026",status:"Активен"}
];

const TRAINER_CLIENTS=[
{client:"Елена Волкова",goal:"Похудение",nextSession:"13 мая 2026",progress:72},
{client:"Дмитрий Ли",goal:"Набор массы",nextSession:"14 мая 2026",progress:58},
{client:"София Чен",goal:"Гибкость",nextSession:"13 мая 2026",progress:85},
{client:"Артём Бруков",goal:"Реабилитация",nextSession:"15 мая 2026",progress:40}
];

const DIARY=[
{client:"Елена Волкова",type:"ВИИТ",date:"12 мая 2026",notes:"30 мин ВИИТ-круг: бёрпи, прыжки на тумбу, махи гирей. 3 раунда по 10 повторений.",progress:"Минус 0.9 кг за неделю."},
{client:"Дмитрий Ли",type:"Силовая",date:"11 мая 2026",notes:"Верхняя часть тела — жим лёжа 3×8 @85кг, жим стоя 3×10 @42кг.",progress:"Новый рекорд в жиме лёжа! +5 кг."},
{client:"София Чен",type:"Йога",date:"10 мая 2026",notes:"60 мин виньяса-флоу. Упор на раскрытие тазобедренных.",progress:"Улучшение глубины наклона вперёд."}
];

const MENU_ITEMS=[
{id:1,name:"Протеиновый коктейль",price:699,cat:"Напитки",img:"images/menu/protein_shake.jpg"},
{id:2,name:"Зелёный смузи",price:749,cat:"Напитки",img:"images/menu/green_smoothie.jpg"},
{id:3,name:"Энергетик",price:399,cat:"Напитки",img:"images/menu/energy_drink.jpg"},
{id:4,name:"Кокосовая вода",price:449,cat:"Напитки",img:"images/menu/coconut_water.jpg"},
{id:5,name:"Протеиновый батончик",price:349,cat:"Протеин",img:"images/menu/protein_bar.jpg"},
{id:6,name:"BCAA-микс",price:599,cat:"Добавки",img:"images/menu/bcaa_mix.png"},
{id:7,name:"Протеиновые шарики",price:499,cat:"Снеки",img:"images/menu/protein_balls.jpg"},
{id:8,name:"Банан",price:149,cat:"Снеки",img:"images/menu/banana.jpg"},
{id:9,name:"Креатин-шот",price:449,cat:"Добавки",img:"images/menu/creatine_shot.jpg"},
{id:10,name:"Асаи-боул",price:999,cat:"Снеки",img:"images/menu/acai_bowl.jpg"},
{id:11,name:"Электролитная вода",price:299,cat:"Напитки",img:"images/menu/electrolyte_water.jpeg"},
{id:12,name:"Латте на овсяном молоке",price:549,cat:"Напитки",img:"images/menu/oat_latte.jpg"}
];

const CLIENT_TRANSACTIONS={};
CLIENTS.forEach(c=>{
  const id=c.id;
  // Create a realistic mix of transactions
  const txns = [
    {desc:"Пополнение баланса",date:"01 мая 2026",amount:Math.floor(Math.random()*20000)+10000,type:"credit"},
    {desc:"Абонемент — "+c.sub,date:"02 мая 2026",amount:-(Math.floor(Math.random()*3000)+2000),type:"debit"}
  ];
  
  // Add some random bar purchases
  if(Math.random() > 0.3) txns.push({desc:"Фитнес-бар: Протеин",date:"05 мая 2026",amount:-699,type:"debit"});
  if(Math.random() > 0.6) txns.push({desc:"Фитнес-бар: Энергетик",date:"08 мая 2026",amount:-399,type:"debit"});
  if(Math.random() > 0.8) txns.push({desc:"Персональная тренировка",date:"10 мая 2026",amount:-1500,type:"debit"});
  
  CLIENT_TRANSACTIONS[id] = txns.reverse(); // Newest first
});

// Clients currently in the gym
const LIVE_CLIENTS = [1, 3, 5, 10]; // IDs of clients currently checked in

const ADMIN_TRAINERS=[
{id:1,first:"Алексей",last:"Смирнов",spec:"Силовой тренинг",clients:4,sessions:156,rating:4.9},
{id:2,first:"Мария",last:"Козлова",spec:"Йога",clients:6,sessions:210,rating:4.8},
{id:3,first:"Дмитрий",last:"Волков",spec:"Кроссфит",clients:5,sessions:98,rating:4.7},
{id:4,first:"Анна",last:"Петрова",spec:"Кардио",clients:5,sessions:134,rating:4.9},
{id:5,first:"Игорь",last:"Сергеев",spec:"Силовой тренинг",clients:3,sessions:87,rating:4.6},
{id:6,first:"Наталья",last:"Орлова",spec:"Пилатес",clients:7,sessions:189,rating:4.8},
{id:7,first:"Вадим",last:"Кузнецов",spec:"Кроссфит",clients:4,sessions:112,rating:4.5},
{id:8,first:"Екатерина",last:"Новикова",spec:"Йога",clients:6,sessions:203,rating:4.9},
{id:9,first:"Павел",last:"Игнатьев",spec:"Кардио",clients:3,sessions:76,rating:4.7},
{id:10,first:"Оксана",last:"Морозова",spec:"Реабилитация",clients:2,sessions:54,rating:4.8}
];

const SCHEDULE=[
{day:"Понедельник",time:"09:00 — 10:00",client:"Елена Волкова",type:"ВИИТ",status:"Подтверждено"},
{day:"Понедельник",time:"11:00 — 12:00",client:"Дмитрий Ли",type:"Силовая",status:"Подтверждено"},
{day:"Вторник",time:"10:00 — 11:00",client:"София Чен",type:"Йога",status:"Подтверждено"},
{day:"Вторник",time:"14:00 — 15:00",client:"Артём Бруков",type:"Реабилитация",status:"Ожидание"},
{day:"Среда",time:"09:00 — 10:00",client:"Елена Волкова",type:"Кардио",status:"Подтверждено"},
{day:"Среда",time:"16:00 — 17:00",client:"Дмитрий Ли",type:"Силовая",status:"Подтверждено"},
{day:"Четверг",time:"10:00 — 11:30",client:"София Чен",type:"Йога",status:"Подтверждено"},
{day:"Пятница",time:"09:00 — 10:00",client:"Елена Волкова",type:"ВИИТ",status:"Подтверждено"},
{day:"Пятница",time:"11:00 — 12:00",client:"Артём Бруков",type:"Реабилитация",status:"Ожидание"}
];
