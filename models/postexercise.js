module.exports = function(sequelize, DataTypes) {
    var PostExercise = sequelize.define('PostExercise', {
        id    : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        tno   : DataTypes.STRING,
        eid   : DataTypes.INTEGER,
        cid   : DataTypes.INTEGER,
        type  : DataTypes.INTEGER,
        exerciseTitle : DataTypes.STRING,
        exerciseContent : DataTypes.STRING,
        options : DataTypes.STRING
    }, {
        tableName : "postexercise"
    }, {
        classMethods : {
            associate:function(models) {
                PostExercise.hasMany(models.Answer);
            }
        }
    });

    return PostExercise
};