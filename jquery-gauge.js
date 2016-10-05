/* global jQuery:true */

"use strict";

/**
 *  Gauge class definition
 */
var Gauge = function (element, options) {
    if (element && element instanceof jQuery) {
        this.init(element, options);
    }
};

Gauge.defaults = {
    template: [
        '<div class="b-gauge">',
        '<svg class="b-gauge__paths b-gauge__block" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>',
        '<div class="b-gauge__marks b-gauge__block"></div>',
        '<div class="b-gauge__labels b-gauge__block"></div>',
        '</div>'
    ].join(''),
    values: {
        0 : '0',
        10: '1',
        20: '2',
        30: '3',
        40: '4',
        50: '5',
        60: '6',
        70: '7',
        80: '8',
        90: '9',
        100: '10'
    },
    colors: {
        0 : '#666',
        50: '#ffa500',
        90: '#f00'
    },
    angles: [
        150,
        390
    ],
    lineWidth: 4,
    arrowWidth: 10,
    arrowColor: '#1e98e4',
    inset: false,

    value: 0
};

Gauge.prototype = {
    constructor: Gauge,
    gaps: [
        [20, 12], // outside gaps @TODO - calculate gaps
        [20, 8]   // inside gaps @TODO - calculate gaps
    ],
    init: function (element, options) {

        var self = this;

        this.options = $.extend({}, Gauge.defaults, options);
        this.$element = $(element);

        this.draw();

        $(window).on('resize', function () {
            self.draw();
        });
    },

    draw: function () {

        this.$element.html(this.options.template);

        this.$paths  = this.$element.find('.b-gauge__paths');
        this.$labels = this.$element.find('.b-gauge__labels');
        this.$marks  = this.$element.find('.b-gauge__marks');

        this.getSizes();
        this.setGaps();

        this.createPaths();
        this.createArrow();
        this.createValues();
        this.createMarks();

        this.setValue(this.options.value);
    },

    /**
     * Get outer sizes
     */
    getSizes: function () {
        var isOutside = (this.options.inset === false);
        this.options.pathsWidth  = (isOutside) ? this.$paths.innerWidth() - (this.gaps[0][0] * 2) : this.$paths.innerWidth();
        this.options.pathsHeight = (isOutside) ? this.$paths.innerHeight() - (this.gaps[0][0] * 2) : this.$paths.innerHeight();

        this.options.labelsWidth  = (isOutside) ? this.$labels.innerWidth() : this.$labels.innerWidth() - (this.gaps[0][0] * 2);
        this.options.labelsHeight = (isOutside) ? this.$labels.innerHeight() : this.$labels.innerHeight() - (this.gaps[0][0] * 2);

        this.options.marksWidth  = (isOutside) ? this.$marks.innerWidth() - (this.gaps[0][1] * 2) : this.$marks.innerWidth() - (this.gaps[1][1] * 2);
        this.options.marksHeight = (isOutside) ? this.$marks.innerHeight() - (this.gaps[0][1] * 2) : this.$marks.innerWidth() - (this.gaps[1][1] * 2);
    },

    /**
     * Set blocks gap
     */
    setGaps: function () {
        var isOutside = (this.options.inset === false);

        this.$paths.css({
            left: (isOutside) ? this.gaps[0][0] : 0,
            top:  (isOutside) ? this.gaps[0][0] : 0
        });
        this.$labels.css({
            left: (isOutside) ? 0 : this.gaps[0][0],
            top:  (isOutside) ? 0 : this.gaps[0][0]
        });
        this.$marks.css({
            left: (isOutside) ? this.gaps[0][1] : this.gaps[1][1],
            top:  (isOutside) ? this.gaps[0][1] : this.gaps[1][1]
        });
    },

    /**
     * Walk by percents with angles
     */
    walkPercents: function (obj, fn) {
        var angle,
            self = this;

        var compareNumbers = function (a, b) {
            return a - b;
        };

        //sort percents
        var percents = Object.keys(obj).map(parseFloat).sort(compareNumbers);
        $.each(percents, function (i, percent) {
            angle = self.getPercentAngle(percent);
            fn.call(self, percent, angle);
        });
    },

    /* Get angel according to aperture */
    getPercentAngle: function (percent) {
        return ((percent * 0.01 * (this.options.angles[1] - this.options.angles[0])) + this.options.angles[0]);
    },

    /**
     * Get coordinates of an angle
     */
    getCoordinate: function (angle, w, h) {
        angle = angle * Math.PI / 180;
        return [
            (Math.cos(angle) * w / 2 + w / 2),
            (Math.sin(angle) * h / 2 + h / 2)
        ];
    },

    /**
     * Create all semicircles
     */
    createPaths: function () {
        var self = this;
        var color,
            lastAngle = this.options.angles[0];

        this.$paths.html('');

        this.walkPercents(this.options.colors, function (percent, angle) {
            if (color) {
                self.createPath(lastAngle, angle, color);
            }
            color     = this.options.colors[percent];
            lastAngle = angle;
        });

        var endAngle = this.options.angles[1];
        self.createPath(lastAngle, endAngle, color);
    },

    /**
     * Create single semicircle
     */
    createPath: function (prevAngle, nextAngle, color) {
        var prevCoords = this.getCoordinate(prevAngle, this.options.pathsWidth, this.options.pathsHeight),
            nextCoords = this.getCoordinate(nextAngle, this.options.pathsWidth, this.options.pathsHeight),
            d          = 'M ' + prevCoords + ' A ' + this.options.pathsWidth / 2 + ' ' + this.options.pathsHeight / 2 + ' 0 ' + (Math.abs(nextAngle - prevAngle) > 180 ? 1 : 0) + ' 1 ' + nextCoords;
        this.appendSVG('path', {
            'class'        : 'b-gauge__path',
            'd'            : d,
            'stroke'       : color,
            'stroke-width' : this.options.lineWidth,
            'fill'         : 'none'
        });
    },

    /**
     * Create arrow
     */
    createArrow: function () {

        // central circle
        this.appendSVG('circle', {
            'class' : 'b-gauge__center',
            'cx'    : this.options.pathsWidth / 2,
            'cy'    : this.options.pathsHeight / 2,
            'r'     : this.options.arrowWidth,
            'fill'  : this.options.arrowColor
        });

        // arrow
        var points = [
            this.options.pathsWidth / 2 - (this.options.arrowWidth / 2) + ',' + this.options.pathsHeight / 2,
            this.options.pathsWidth / 2 + (this.options.arrowWidth / 2) + ',' + this.options.pathsHeight / 2,
            this.options.pathsWidth / 2 + ',' + 0
        ].join(' ');
        this.appendSVG('polyline', {
            'class'  : 'b-gauge__arrow',
            'points' : points,
            'fill'   : this.options.arrowColor
            'height' : this.options.pathsHeight / 2
        });
    },

    /* Append SVG */
    appendSVG: function (type, attributes) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', type);
        $.each(attributes, function (name, value) {
            path.setAttribute(name, value);
        });
        this.$paths.append(path);
    },

    /* Set value */
    setValue: function (value) {
        this.options.value = value;
        var angle = this.getPercentAngle(value);
        var arrow = this.$element.find('.b-gauge__arrow');
        var height = arrow[0].getAttribute('height');
        arrow.attr({transform: 'rotate(' + (angle + 90) + ' ' + height + ' ' + height + ')'});
    },

    /* Create text labels */
    createValues: function () {
        this.walkPercents(this.options.values, function (percent, angle) {
            var coords = this.getCoordinate(angle, this.options.labelsWidth, this.options.labelsHeight);
            var $label = $('<div>').addClass('b-gauge__label').text(this.options.values[percent]);

            this.$labels.append($label);
            $label.css({
                left: coords[0] - $label.width() / 2,
                top: coords[1] - $label.height() / 2
            });
        });
    },
    /* Create text marks */
    createMarks: function () {
        this.walkPercents(this.options.values, function (percent, angle) {
            var coords = this.getCoordinate(angle, this.options.marksWidth, this.options.marksHeight);
            var $mark = $('<div>').addClass('b-gauge__mark');

            this.$marks.append($mark);
            $mark.css({
                transform: 'rotate(' + (angle + 90) + 'deg)',
                left: coords[0] - $mark.width() / 2,
                top: coords[1] - $mark.height() / 2
            });
        });
    }
};

/**
 * jQuery plugin implementation
 */
$.fn.gauge = function (option) {
    return this.each(function () {
        var $this = $(this);
        var data = $this.data('plugin-gauge');
        var options = typeof option === 'object' && option;
        if (!data) {
            $this.data('plugin-gauge', (data = new Gauge($(this), options)));
        }
        if (typeof option === 'string') {
            data[option]();
        }
    });
};

$.fn.gauge.Constructor = Gauge;