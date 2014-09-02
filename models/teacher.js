module.exports = function(sequelize, DataTypes) {
    var Teacher = sequelize.define('Teacher', {
        id : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        tno : DataTypes.STRING,
        name : DataTypes.STRING,
        password : DataTypes.STRING,
        role : DataTypes.STRING
    }, {
        tableName : "teacher"
    });

    return Teacher
};