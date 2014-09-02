module.exports = function(sequelize, DataTypes) {
    var Answer = sequelize.define('Answer', {
        id     : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        sno    : DataTypes.STRING,
        eid    : DataTypes.INTEGER,
        cid    : DataTypes.INTEGER,
        answer : DataTypes.STRING
    }, {
        tableName : "answer"
    }, {
        classMethods : {
            associate:function(models) {
                Answer.belongsTo(models.PostExercise, {foreignKey:'eid'});
            }
        }
    });
    return Answer
};