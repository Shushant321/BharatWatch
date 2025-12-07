import React, { useState } from "react";
import "./categories.css";

const Categories = ({ onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Education",
    "Entertainment",
    "Music",
    "Gaming",
    "News",
    "Sports",
    "Technology",
    "Travel",
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <section className="categories-section">
      <div className="categories-container">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;