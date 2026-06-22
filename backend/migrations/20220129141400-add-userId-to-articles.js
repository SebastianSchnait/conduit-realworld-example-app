"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "userId", {
      type: Sequelize.INTEGER,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Articles", "userId");
  },
};
