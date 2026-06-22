"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Followers", {
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      followerId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Followers");
  },
};
