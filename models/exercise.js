module.exports = function(sequelize, DataTypes) {
    var Exercise = sequelize.define('Exercise', {
        id      : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        type    : DataTypes.INTEGER,
        content : DataTypes.STRING,
        title   : DataTypes.STRING,
        answer  : DataTypes.STRING,
        options : DataTypes.STRING,
        tid     : DataTypes.INTEGER
    }, {
        tableName : "exercise"
    }, {
        classMethods : {
            associate:function(models) {
                Exercise.hasMany(models.Course);
            }
        }
    });

    return Exercise
};