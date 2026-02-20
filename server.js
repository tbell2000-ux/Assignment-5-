const express = require("express");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = 4000;

app.use(express.json());

// MY DOCUMENTATION: https://documenter.getpostman.com/view/52400511/2sBXcEjL4X

// Request Logging Middleware

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request Body:");
    console.log(JSON.stringify(req.body, null, 2));
  }

  next();
};

app.use(requestLogger);


const menuValidation = [
  body("name")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body("description")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),

  body("category")
    .isIn(["appetizer", "entree", "dessert", "beverage"])
    .withMessage("Category must be appetizer, entree, dessert, or beverage"),

  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("Ingredients must be an array with at least 1 item"),

  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false")
];


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);

    return res.status(400).json({
      error: "Validation failed",
      messages
    });
  }

 
  if (req.body.available === undefined) {
    req.body.available = true;
  }

  next();
};


// Menu Items

let menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];



// GET all menu items
app.get("/api/menu", (req, res) => {
  res.status(200).json(menuItems);
});

// GET single menu item
app.get("/api/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(menu => menu.id === id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  res.status(200).json(item);
});

// POST new item
app.post(
  "/api/menu",
  menuValidation,
  handleValidationErrors,
  (req, res) => {
    const newItem = {
      id: menuItems.length > 0
        ? menuItems[menuItems.length - 1].id + 1
        : 1,
      ...req.body
    };

    menuItems.push(newItem);
    res.status(201).json(newItem);
  }
);

// PUT update item
app.put(
  "/api/menu/:id",
  menuValidation,
  handleValidationErrors,
  (req, res) => {
    const id = parseInt(req.params.id);
    const index = menuItems.findIndex(menu => menu.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    menuItems[index] = {
      ...menuItems[index],
      ...req.body
    };

    res.status(200).json(menuItems[index]);
  }
);

// DELETE item
app.delete("/api/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(menu => menu.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const deletedItem = menuItems.splice(index, 1);

  res.status(200).json({
    message: "Item deleted successfully",
    deletedItem
  });
});


// Start Server,  I had to change it to port 4000 because 3000 wasn't working.
// MY DOCUMENTATION: https://documenter.getpostman.com/view/52400511/2sBXcEjL4X

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});