const sequelize = require('../setup/sequelize');
const { DataTypes } = require('sequelize-cockroachdb');

const user = sequelize.define('user', {
   id: {
      type: DataTypes.STRING,
      primaryKey: true
   },

   new: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
   },

   name: {
      type: DataTypes.STRING,
      allowNull: true
   },

   vincy: {
      type: DataTypes.INTEGER,
      defaultValue: 0
   },

   energy: {
      type: DataTypes.INTEGER,
      defaultValue: 100
   },

   level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
   },

   exp_value: {
      type: DataTypes.INTEGER,
      defaultValue: 0
   },

   exp_max: {
      type: DataTypes.INTEGER,
      defaultValue: 100
   },

   cooldown_daily: {
      type: DataTypes.BIGINT,
      defaultValue: 0
   },

   cooldown_fontana: {
      type: DataTypes.BIGINT,
      defaultValue: 0
   },

   streak_daily: {
      type: DataTypes.INTEGER,
      defaultValue: 0
   }
});

module.exports = user;