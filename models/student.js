module.exports = function(sequelize, DataTypes) {
    var Student = sequelize.define('Student', {
        id        : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        sno       : DataTypes.STRING,
        name      : DataTypes.STRING,
        password  : DataTypes.STRING,
        classname : DataTypes.STRING
    }, {
        tableName : "student"
    });

    return Student
};