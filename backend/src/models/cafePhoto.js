const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CafePhoto = sequelize.define('CafePhoto', {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        cafe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        url: { type: DataTypes.STRING(255), allowNull: false },
        caption: { type: DataTypes.STRING(255), allowNull: true },
        is_archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'cafe_photos',
        timestamps: false,
        underscored: true,
    });

    return CafePhoto;
};


