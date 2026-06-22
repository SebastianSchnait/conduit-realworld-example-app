"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TagList", {
      articleId: {
        type: Sequelize.INTEGER,
        references: { model: "Articles", key: "id" },
        onDelete: "CASCADE",
      },
      tagName: {
        type: Sequelize.STRING,
        references: { model: "Tags", key: "name" },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("TagList");
  },
};
