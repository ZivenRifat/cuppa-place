module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    cafe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.ENUM('published', 'pending'), defaultValue: 'published' },
    is_live_comment: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'reviews',
    underscored: true,
  });
  return Review;
};
