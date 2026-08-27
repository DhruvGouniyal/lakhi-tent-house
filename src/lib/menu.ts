/**
 * The menu, transcribed from the printed brochure
 * (Lakhi_Tent_House_Caters_A4_Designer_Final_Touchup.pdf).
 *
 * Nine numbered categories, each holding one or more named groups. Kept as
 * plain data so the layout can change without anyone retyping ~250 dishes, and
 * so it can later feed a CMS or a quote form unchanged.
 *
 * Items are reproduced exactly as printed, including the places where the
 * brochure deliberately repeats a dish across groups (Shikanji appears under
 * both Welcome Drinks and Refreshing Favourites, for instance).
 */

export interface MenuGroup {
  title: string;
  items: string[];
}

export interface MenuCategory {
  /** "01".."09", as printed. */
  number: string;
  /** Anchor id, also used by the film's chapter links. */
  id: string;
  title: string;
  blurb: string;
  groups: MenuGroup[];
  /** The gold line printed under some categories. */
  note?: string;
}

export const BUSINESS = {
  name: "Lakhi Tent House & Caters",
  tagline: "A celebration of taste, made with love",
  services: ["Wedding", "Marriage", "Functions", "Events"],
  phone: "79867-21787",
  phoneHref: "tel:+917986721787",
} as const;

export const MENU: MenuCategory[] = [
  {
    number: "01",
    id: "welcome-drinks",
    title: "Welcome Drinks",
    blurb:
      "Begin the celebration with refreshing welcome beverages and traditional favourites.",
    note: "Welcome service • custom combinations available",
    groups: [
      {
        title: "Welcome Drinks",
        items: [
          "Kesar Milk", "Badam Milk", "Kesar Chhanch", "Lassi (Sweet / Salted)",
          "Shikanji", "Fresh Lime Soda", "Jaljeera", "Aam Panna", "Masala Chaas",
          "Mango Shake", "Fruit Punch", "Ginger Lemonade", "Mocktails",
          "Virgin Mojitos", "Rooh Afza Milk", "Fresh Seasonal Juice",
        ],
      },
      {
        title: "Refreshing Favourites",
        items: [
          "Shikanji", "Fresh Lime Soda", "Jaljeera", "Aam Panna", "Masala Chaas",
          "Mango Shake", "Fruit Punch", "Ginger Lemonade", "Mocktails", "Virgin Mojitos",
        ],
      },
      {
        title: "Traditional Favourites",
        items: [
          "Kesar Milk", "Badam Milk", "Kesar Chhanch", "Lassi (Sweet / Salted)",
          "Rooh Afza Milk", "Fresh Seasonal Juice",
        ],
      },
    ],
  },
  {
    number: "02",
    id: "breakfast",
    title: "Breakfast & Morning Favourites",
    blurb: "A complete morning spread, with vegetarian and non-vegetarian choices.",
    note: "Breakfast can be combined with selected live counters",
    groups: [
      {
        title: "Breakfast • Vegetarian",
        items: [
          "Paneer Pakora", "Gobi Pakora", "Palak Pakora", "Aloo Finger", "Aloo Chips",
          "Shimla Mirch Pakora", "Bread Pakora", "Veg Cutlet", "Veg Manchurian",
          "Bread Sandwich", "Aloo Poori", "Chole Bhature", "Amritsari Kulcha", "Poha",
          "Upma", "Idli", "Medu Vada", "Sambar", "Coconut Chutney",
        ],
      },
      {
        title: "Breakfast • Non-Vegetarian",
        items: [
          "Chicken Pakora", "Chilli Chicken Boneless", "Chicken Kaleji", "Fish Fry",
          "Fish Amritsari", "Mutton Tikka", "Omelette", "Keema Kaleji",
          "Masala Omelette", "Egg Bhurji", "Keema Matar",
        ],
      },
    ],
  },
  {
    number: "03",
    id: "live-counters",
    title: "Live Counters & Chaat",
    blurb: "Interactive stations designed for fresh preparation and guest engagement.",
    groups: [
      {
        title: "Chaat & Indian Live",
        items: [
          "Dahi Bhalla Chaat", "Cream Bhalla Chaat", "Golgappe / Pani Puri",
          "Tokri Chaat", "Papdi Chaat", "Aloo Tikki Chaat", "Pav Bhaji", "Dosa",
          "Sambar Vada", "Fresh Fruit Stall", "Jalebi Live", "Rabri Faluda",
          "Kulfi Counter", "Amritsari Naan", "Punjabi Rasoi",
        ],
      },
      {
        title: "Popular Live Stations",
        items: [
          "Live Pasta Station", "Taco & Burrito Bar", "Bao & Dim Sum Station",
          "Live Tandoor & Barbecue Grill", "Sushi Bar", "Live Waffle Station",
          "Rolled Ice-Cream Counter", "Live Bakery Counter", "Gourmet Coffee & Tea Bar",
        ],
      },
      {
        title: "Fun Food Stations",
        items: [
          "Popcorn", "Candy", "Pizza", "Burger", "Noodles", "Sweet Corn",
          "Grill Sandwich", "Ice Gola",
        ],
      },
    ],
  },
  {
    number: "04",
    id: "starters",
    title: "Starters & Appetisers",
    blurb: "Crisp • grilled • tandoor • Indo-Chinese.",
    groups: [
      {
        title: "Vegetarian Starters",
        items: [
          "Paneer Tikka", "Hara Bhara Kebab", "Masala Aloo", "Mushroom Tikka",
          "Mushroom Golden", "Cheese Corn Roll", "Veg Spring Roll", "Dahi Kebab",
          "Veg Seekh Kebab", "Stuffed Cheese Tikka", "Italian Roll",
          "Honey Chilli Potato", "Malai Broccoli Tikka", "Manchurian Dry",
          "Manchurian Gravy", "Cheese Finger", "Cheese Chilli", "Cheese Kofta Kebab",
          "Til Kebab", "Kathi Roll", "Veg Momos", "Mushroom Chilli", "Chilli Potato",
          "Soya Chaap Tikka", "Afghani Soya Chaap", "Cigar Roll", "Cheese Garlic",
          "Stuffed Mushroom", "Veg Fish Fry",
        ],
      },
      {
        title: "Non-Vegetarian Starters",
        items: [
          "Chicken Tikka", "Chicken Malai Tikka", "Chicken Seekh Kebab",
          "Chicken Tangri Kebab", "Chicken 65", "Chicken Wings", "Chilli Chicken",
          "Chicken Spring Roll", "Chicken Reshmi Kebab", "Chicken Afghani",
          "Chicken Tandoori", "Chicken Fry", "Chicken Salami", "Fish Fry", "Fish Tikka",
          "Fish Tandoori", "Mutton Seekh Kebab", "Mutton Tikka", "Mutton Chap Tawa",
          "Keema Kaleji Tawa",
        ],
      },
    ],
  },
  {
    number: "05",
    id: "main-veg",
    title: "Indian Main Course • Vegetarian",
    blurb: "Rich gravies, Punjabi favourites and classic Indian comfort dishes.",
    groups: [
      {
        title: "Vegetarian Main Course",
        items: [
          "Dal Makhni", "Dal Tadka", "Mix Veg", "Paneer Butter Masala",
          "Paneer Tikka Masala", "Shahi Paneer", "Kadai Paneer", "Palak Paneer",
          "Matar Paneer", "Matar Malai Methi", "Matar Shahi Korma", "Malai Kofta",
          "Palak Kofta", "Mushroom Do Pyaza", "Mushroom Masala", "Aloo Gobhi",
          "Jeera Aloo", "Chana Masala", "Rajma Masala", "Palak Chana", "Bhindi Masala",
          "Baingan Bharta", "Kadhi Pakora", "Sarson Ka Saag", "Punjabi Chole",
          "Navratan Korma",
        ],
      },
      {
        title: "Additional Indian Favourites",
        items: [
          "Kadhi Pakora", "Rajma Masala", "Punjabi Chole", "Sarson Ka Saag",
          "Baingan Bharta", "Navratan Korma",
        ],
      },
    ],
  },
  {
    number: "06",
    id: "main-nonveg",
    title: "Indian Main Course • Non-Vegetarian",
    blurb: "Chicken, mutton, fish and egg preparations for the main dining course.",
    groups: [
      {
        title: "Non-Vegetarian Main Course",
        items: [
          "Butter Chicken", "Chicken Kadai", "Chicken Tikka Masala", "Chicken Handi",
          "Chicken Curry", "Chicken Masala", "Chicken Changezi", "Methi Chicken",
          "Cream Chicken", "Mutton Rogan Josh", "Mutton Handi", "Mutton Masala",
          "Rara Mutton", "Palak Meat", "Keema Matar", "Keema Kaleji", "Egg Curry",
          "Fish Curry", "Mutton Korma", "Mutton Do Pyaza",
        ],
      },
      {
        title: "Chef's Biryani & Rice Additions",
        items: [
          "Chicken Biryani", "Mutton Biryani", "Plain Rice", "Jeera Rice", "Veg Biryani",
          "Veg Pulao", "Kashmiri Pulao", "Peas Pulao", "Fried Rice", "Saffron Rice",
        ],
      },
    ],
  },
  {
    number: "07",
    id: "breads-rice",
    title: "Breads • Rice • Salads • Accompaniments",
    blurb: "Complete the main course with breads, rice, raita, salads, pickles and chutneys.",
    groups: [
      {
        title: "Breads",
        items: [
          "Naan", "Butter Naan", "Garlic Naan", "Missi Roti", "Lachha Paratha",
          "Plain Paratha", "Rumali Roti", "Tandoori Roti", "Makki Roti",
          "Tandoori Butter Roti", "Amritsari Kulcha", "Pudina Paratha",
          "Stuffed Aloo Paratha", "Chapati",
        ],
      },
      {
        title: "Rice & Biryani",
        items: [
          "Plain Rice", "Jeera Rice", "Veg Biryani", "Mutton Biryani", "Chicken Biryani",
          "Veg Pulao", "Kashmiri Pulao", "Peas Pulao", "Fried Rice", "Saffron Rice",
        ],
      },
      {
        title: "Salads & Accompaniments",
        items: [
          "Green Salad", "Russian Salad", "Fruit Salad", "Bean Salad", "Cream Salad",
          "Macaroni Salad", "Decoration Salad", "Boondi Raita", "Pudina Raita",
          "Mix Raita", "Plain Raita", "Curd", "Papad", "Achar Pachranga", "Achar Onion",
          "Green Chutney", "Tamarind Chutney", "Mint Chutney", "Pickle & Onion",
          "Murabba", "Achar Stall",
        ],
      },
    ],
  },
  {
    number: "08",
    id: "chinese-asian",
    title: "Chinese & Asian Specialties",
    blurb: "Vegetarian and non-vegetarian Indo-Chinese and Asian-inspired selections.",
    groups: [
      {
        title: "Chinese & Asian • Vegetarian",
        items: [
          "Hakka Noodles", "Chilli Garlic Noodles", "Veg Manchurian Dry",
          "Veg Manchurian Gravy", "Veg Fried Rice", "Chilli Paneer", "Mushroom Chilli",
          "Honey Chilli Potato", "Veg Spring Roll", "Sweet & Sour Vegetables",
          "Thai Red Curry • Veg", "Thai Green Curry • Veg", "Crispy Corn",
        ],
      },
      {
        title: "Chinese & Asian • Non-Vegetarian",
        items: [
          "Chilli Chicken", "Chicken Manchurian", "Chicken Fried Rice",
          "Chicken Hakka Noodles", "Chicken Sweet & Sour", "Chicken Garlic Sauce",
          "Fish Chilli", "Fish in Hot Garlic Sauce", "Prawn Chilli Garlic • Seasonal",
          "Thai Red Curry • Chicken", "Thai Green Curry • Chicken", "Schezwan Chicken",
        ],
      },
    ],
  },
  {
    number: "09",
    id: "sweets",
    title: "Sweets & Desserts",
    blurb: "A sweet finish to the celebration.",
    note: "We serve with passion • you celebrate with joy",
    groups: [
      {
        title: "Sweets & Desserts",
        items: [
          "Gulab Jamun", "Garam Gulab Jamun", "Rasgulla", "Ras Malai",
          "Kesar Ras Malai", "Gajjar Halwa", "Moong Dal Halwa", "Amriti Rabri",
          "Jalebi", "Jalebi with Rabri", "Kheer", "Phirni", "Gajar Ki Kheer", "Kulfi",
          "Ice Cream • Assorted Flavours", "Brownie", "Fresh Fruit & Cream",
          "Dessert Counter • Seasonal",
        ],
      },
      {
        title: "Dessert Counter Options",
        items: [
          "Jalebi with Rabri", "Kulfi Assorted Flavours", "Ice Cream Counter",
          "Brownie & Fresh Fruit", "Seasonal Dessert Counter", "Live Bakery",
          "Rolled Ice-Cream", "Waffle Station",
        ],
      },
      {
        title: "Premium Beverage Finish",
        items: [
          "Gourmet Coffee & Tea Bar", "Ginger Lemonade", "Mocktails", "Virgin Mojitos",
        ],
      },
    ],
  },
];

export const MENU_ITEM_COUNT = MENU.reduce(
  (n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0),
  0
);
