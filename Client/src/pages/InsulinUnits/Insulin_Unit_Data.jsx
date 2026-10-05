// Import Images
import riceImg from "../../Images/Shop_Images/Product1.jpg";
import chickenImg from "../../Images/Shop_Images/Product1.jpg";
import pastaImg from "../../Images/Shop_Images/Product1.jpg";
import pizzaImg from "../../Images/Shop_Images/Product1.jpg";
import burgerImg from "../../Images/Shop_Images/Product1.jpg";
import friesImg from "../../Images/Shop_Images/Product1.jpg";
import saladImg from "../../Images/Shop_Images/Product1.jpg";
import salmonImg from "../../Images/Shop_Images/Product1.jpg";
import orangeJuiceImg from "../../Images/Shop_Images/Product1.jpg";
import cokeImg from "../../Images/Shop_Images/Product1.jpg";
import milkImg from "../../Images/Shop_Images/Product1.jpg";
import coffeeImg from "../../Images/Shop_Images/Product1.jpg";
import waterImg from "../../Images/Shop_Images/Product1.jpg";
import appleJuiceImg from "../../Images/Shop_Images/Product1.jpg";
import cakeImg from "../../Images/Shop_Images/Product1.jpg";
import donutImg from "../../Images/Shop_Images/Product1.jpg";
import iceCreamImg from "../../Images/Shop_Images/Product1.jpg";
import cookieImg from "../../Images/Shop_Images/Product1.jpg";
import brownieImg from "../../Images/Shop_Images/Product1.jpg";
import cheesecakeImg from "../../Images/Shop_Images/Product1.jpg";

export const getFoodDatabase = (t) => [
  { id: 1, name: t("InsulinUnit.FoodRice"), category: "Food", carbs: 45, image: riceImg },
  { id: 2, name: t("InsulinUnit.FoodChicken"), category: "Food", carbs: 0, image: chickenImg },
  { id: 3, name: t("InsulinUnit.FoodPasta"), category: "Food", carbs: 43, image: pastaImg },
  { id: 4, name: t("InsulinUnit.FoodPizza"), category: "Food", carbs: 36, image: pizzaImg },
  { id: 5, name: t("InsulinUnit.FoodBurger"), category: "Food", carbs: 30, image: burgerImg },
  { id: 6, name: t("InsulinUnit.FoodFries"), category: "Food", carbs: 48, image: friesImg },
  { id: 7, name: t("InsulinUnit.FoodSalad"), category: "Food", carbs: 5, image: saladImg },
  { id: 8, name: t("InsulinUnit.FoodSalmon"), category: "Food", carbs: 0, image: salmonImg },
  { id: 9, name: t("InsulinUnit.DrinkOrange"), category: "Drinks", carbs: 26, image: orangeJuiceImg },
  { id: 10, name: t("InsulinUnit.DrinkCoke"), category: "Drinks", carbs: 39, image: cokeImg },
  { id: 11, name: t("InsulinUnit.DrinkMilk"), category: "Drinks", carbs: 12, image: milkImg },
  { id: 12, name: t("InsulinUnit.DrinkCoffee"), category: "Drinks", carbs: 30, image: coffeeImg },
  { id: 13, name: t("InsulinUnit.DrinkWater"), category: "Drinks", carbs: 0, image: waterImg },
  { id: 14, name: t("InsulinUnit.DrinkApple"), category: "Drinks", carbs: 28, image: appleJuiceImg },
  { id: 15, name: t("InsulinUnit.SweetCake"), category: "Sweets", carbs: 55, image: cakeImg },
  { id: 16, name: t("InsulinUnit.SweetDonut"), category: "Sweets", carbs: 35, image: donutImg },
  { id: 17, name: t("InsulinUnit.SweetIceCream"), category: "Sweets", carbs: 25, image: iceCreamImg },
  { id: 18, name: t("InsulinUnit.SweetCookie"), category: "Sweets", carbs: 20, image: cookieImg },
  { id: 19, name: t("InsulinUnit.SweetBrownie"), category: "Sweets", carbs: 40, image: brownieImg },
  { id: 20, name: t("InsulinUnit.SweetCheesecake"), category: "Sweets", carbs: 32, image: cheesecakeImg },
];