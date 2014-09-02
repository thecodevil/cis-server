module.exports = function(sequelize, DataTypes) {
    var CourseExercise = sequelize.define('CourseExercise', {
        id         : {type : DataTypes.INTEGER, autoIncrement : true, primaryKey : true, unique : true},
        courseId   : DataTypes.INTEGER,
        exerciseId : DataTypes.INTEGER,
        tid        : DataTypes.STRING
    }, {
        tableName : "course_exercise"
    });

    return CourseExercise
};