var ExerciseService = function () {

    this.Course = require('../models').Course;
    this.Exercise = require('../models').Exercise;

    this.Course.hasMany(this.Exercise, {through: 'course_exercise'})
    this.Exercise.hasMany(this.Course, {through: 'course_exercise'})

};

ExerciseService.prototype = {
    countOfCourseExercises: function (cid, cb) {
        this.Course.find({ where: {id: cid}})
            .complete(function (err, course) {
                course.getExercises({attributes: ['exercise.id', 'type', 'title', 'content', 'answer', 'options']}).success(function (exercises) {
                    var _exeArray = [];
                    for (var i = 0; i < exercises.length; i++) {
                        _exeArray.push(exercises[i].selectedValues);
                    }
                    cb(_exeArray)
                })
            });
    }
};

var exerciseService = module.exports = exports = new ExerciseService;