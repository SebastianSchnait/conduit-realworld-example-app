"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Comments", "articleId", {
      type: Sequelize.INTEGER,
      references: { model: "Articles", key: "id" },
      onDelete: "CASCADE",
      allowNull: true,
    });
    await queryInterface.addColumn("Comments", "userId", {
      type: Sequelize.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Comments", "articleId");
    await queryInterface.removeColumn("Comments", "userId");
  },
};
