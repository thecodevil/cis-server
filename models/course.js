module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('Course', {
        id        : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        title     : DataTypes.STRING,
        tid       : DataTypes.INTEGER,
        classname : DataTypes.STRING
    }, {
        tableName : "course"
    }, {
        classMethods : {
            associate:function(models) {
                Course.hasMany(models.Exercise);
            }
        }
    });

    return Course
};