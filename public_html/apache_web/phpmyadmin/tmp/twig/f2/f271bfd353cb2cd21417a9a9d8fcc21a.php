<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\CoreExtension;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* javascript/variables.twig */
class __TwigTemplate_d4af75525717853f25dfe043bdd0cad0 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 2
        yield "var firstDayOfCalendar = '";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["first_day_of_calendar"] ?? null), "js", null, true);
        yield "';
var themeImagePath = '";
        // line 3
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['PhpMyAdmin\Twig\AssetExtension']->getImagePath(), "js", null, true);
        yield "';
var mysqlDocTemplate = '";
        // line 4
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(PhpMyAdmin\Util::getMySQLDocuURL("%s"), "js", null, true);
        yield "';
var maxInputVars = ";
        // line 5
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["max_input_vars"] ?? null), "js", null, true);
        yield ";

";
        // line 7
        $context["show_month_after_year"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Month-year order for calendar, use either "calendar-month-year" or "calendar-year-month".
yield _gettext("calendar-month-year");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        // line 10
        $context["year_suffix"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Year suffix for calendar, "none" is empty.
yield _gettext("none");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        // line 14
        yield "if (\$.datepicker) {
  \$.datepicker.regional[''].closeText = '";
        // line 15
        $___internal_parse_1_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Display text for calendar close link
yield _gettext("Done");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_1_, "js");
        yield "';
  \$.datepicker.regional[''].prevText = '";
        // line 16
        $___internal_parse_2_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Previous month. Display text for previous month link in calendar
yield _gettext("Prev");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_2_, "js");
        yield "';
  \$.datepicker.regional[''].nextText = '";
        // line 17
        $___internal_parse_3_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Next month. Display text for next month link in calendar
yield _gettext("Next");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_3_, "js");
        yield "';
  \$.datepicker.regional[''].currentText = '";
        // line 18
        $___internal_parse_4_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Display text for current month link in calendar
yield _gettext("Today");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_4_, "js");
        yield "';
  \$.datepicker.regional[''].monthNames = [
    '";
        // line 20
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("January"), "js", null, true);
        yield "',
    '";
        // line 21
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("February"), "js", null, true);
        yield "',
    '";
        // line 22
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("March"), "js", null, true);
        yield "',
    '";
        // line 23
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("April"), "js", null, true);
        yield "',
    '";
        // line 24
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("May"), "js", null, true);
        yield "',
    '";
        // line 25
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("June"), "js", null, true);
        yield "',
    '";
        // line 26
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("July"), "js", null, true);
        yield "',
    '";
        // line 27
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("August"), "js", null, true);
        yield "',
    '";
        // line 28
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("September"), "js", null, true);
        yield "',
    '";
        // line 29
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("October"), "js", null, true);
        yield "',
    '";
        // line 30
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("November"), "js", null, true);
        yield "',
    '";
        // line 31
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("December"), "js", null, true);
        yield "',
  ];
  \$.datepicker.regional[''].monthNamesShort = [
    '";
        // line 34
        $___internal_parse_5_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for January
yield _gettext("Jan");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_5_, "js");
        yield "',
    '";
        // line 35
        $___internal_parse_6_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for February
yield _gettext("Feb");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_6_, "js");
        yield "',
    '";
        // line 36
        $___internal_parse_7_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for March
yield _gettext("Mar");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_7_, "js");
        yield "',
    '";
        // line 37
        $___internal_parse_8_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for April
yield _gettext("Apr");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_8_, "js");
        yield "',
    '";
        // line 38
        $___internal_parse_9_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for May
yield _gettext("May");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_9_, "js");
        yield "',
    '";
        // line 39
        $___internal_parse_10_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for June
yield _gettext("Jun");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_10_, "js");
        yield "',
    '";
        // line 40
        $___internal_parse_11_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for July
yield _gettext("Jul");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_11_, "js");
        yield "',
    '";
        // line 41
        $___internal_parse_12_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for August
yield _gettext("Aug");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_12_, "js");
        yield "',
    '";
        // line 42
        $___internal_parse_13_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for September
yield _gettext("Sep");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_13_, "js");
        yield "',
    '";
        // line 43
        $___internal_parse_14_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for October
yield _gettext("Oct");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_14_, "js");
        yield "',
    '";
        // line 44
        $___internal_parse_15_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for November
yield _gettext("Nov");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_15_, "js");
        yield "',
    '";
        // line 45
        $___internal_parse_16_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short month name for December
yield _gettext("Dec");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_16_, "js");
        yield "',
  ];
  \$.datepicker.regional[''].dayNames = [
    '";
        // line 48
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Sunday"), "js", null, true);
        yield "',
    '";
        // line 49
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Monday"), "js", null, true);
        yield "',
    '";
        // line 50
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Tuesday"), "js", null, true);
        yield "',
    '";
        // line 51
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Wednesday"), "js", null, true);
        yield "',
    '";
        // line 52
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Thursday"), "js", null, true);
        yield "',
    '";
        // line 53
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Friday"), "js", null, true);
        yield "',
    '";
        // line 54
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Saturday"), "js", null, true);
        yield "',
  ];
  \$.datepicker.regional[''].dayNamesShort = [
    '";
        // line 57
        $___internal_parse_17_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Sunday
yield _gettext("Sun");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_17_, "js");
        yield "',
    '";
        // line 58
        $___internal_parse_18_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Monday
yield _gettext("Mon");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_18_, "js");
        yield "',
    '";
        // line 59
        $___internal_parse_19_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Tuesday
yield _gettext("Tue");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_19_, "js");
        yield "',
    '";
        // line 60
        $___internal_parse_20_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Wednesday
yield _gettext("Wed");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_20_, "js");
        yield "',
    '";
        // line 61
        $___internal_parse_21_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Thursday
yield _gettext("Thu");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_21_, "js");
        yield "',
    '";
        // line 62
        $___internal_parse_22_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Friday
yield _gettext("Fri");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_22_, "js");
        yield "',
    '";
        // line 63
        $___internal_parse_23_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Short week day name for Saturday
yield _gettext("Sat");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_23_, "js");
        yield "',
  ];
  \$.datepicker.regional[''].dayNamesMin = [
    '";
        // line 66
        $___internal_parse_24_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Sunday
yield _gettext("Su");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_24_, "js");
        yield "',
    '";
        // line 67
        $___internal_parse_25_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Monday
yield _gettext("Mo");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_25_, "js");
        yield "',
    '";
        // line 68
        $___internal_parse_26_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Tuesday
yield _gettext("Tu");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_26_, "js");
        yield "',
    '";
        // line 69
        $___internal_parse_27_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Wednesday
yield _gettext("We");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_27_, "js");
        yield "',
    '";
        // line 70
        $___internal_parse_28_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Thursday
yield _gettext("Th");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_28_, "js");
        yield "',
    '";
        // line 71
        $___internal_parse_29_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Friday
yield _gettext("Fr");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_29_, "js");
        yield "',
    '";
        // line 72
        $___internal_parse_30_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Minimal week day name for Saturday
yield _gettext("Sa");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_30_, "js");
        yield "',
  ];
  \$.datepicker.regional[''].weekHeader = '";
        // line 74
        $___internal_parse_31_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: Column header for week of the year in calendar
yield _gettext("Wk");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_31_, "js");
        yield "';
  \$.datepicker.regional[''].showMonthAfterYear = ";
        // line 75
        yield (((($context["show_month_after_year"] ?? null) == "calendar-year-month")) ? ("true") : ("false"));
        yield ";
  \$.datepicker.regional[''].yearSuffix = '";
        // line 76
        yield (((($context["year_suffix"] ?? null) != "none")) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["year_suffix"] ?? null), "js")) : (""));
        yield "';
  \$.extend(\$.datepicker._defaults, \$.datepicker.regional['']);
}

if (\$.timepicker) {
  \$.timepicker.regional[''].timeText = '";
        // line 81
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Time"), "js", null, true);
        yield "';
  \$.timepicker.regional[''].hourText = '";
        // line 82
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Hour"), "js", null, true);
        yield "';
  \$.timepicker.regional[''].minuteText = '";
        // line 83
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Minute"), "js", null, true);
        yield "';
  \$.timepicker.regional[''].secondText = '";
        // line 84
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Second"), "js", null, true);
        yield "';
  \$.extend(\$.timepicker._defaults, \$.timepicker.regional['']);
}

function extendingValidatorMessages () {
  \$.extend(\$.validator.messages, {
    required: '";
        // line 90
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("This field is required"), "js", null, true);
        yield "',
    remote: '";
        // line 91
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please fix this field"), "js", null, true);
        yield "',
    email: '";
        // line 92
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid email address"), "js", null, true);
        yield "',
    url: '";
        // line 93
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid URL"), "js", null, true);
        yield "',
    date: '";
        // line 94
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid date"), "js", null, true);
        yield "',
    dateISO: '";
        // line 95
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid date ( ISO )"), "js", null, true);
        yield "',
    number: '";
        // line 96
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid number"), "js", null, true);
        yield "',
    creditcard: '";
        // line 97
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid credit card number"), "js", null, true);
        yield "',
    digits: '";
        // line 98
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter only digits"), "js", null, true);
        yield "',
    equalTo: '";
        // line 99
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter the same value again"), "js", null, true);
        yield "',
    maxlength: \$.validator.format('";
        // line 100
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter no more than {0} characters"), "js", null, true);
        yield "'),
    minlength: \$.validator.format('";
        // line 101
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter at least {0} characters"), "js", null, true);
        yield "'),
    rangelength: \$.validator.format('";
        // line 102
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a value between {0} and {1} characters long"), "js", null, true);
        yield "'),
    range: \$.validator.format('";
        // line 103
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a value between {0} and {1}"), "js", null, true);
        yield "'),
    max: \$.validator.format('";
        // line 104
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a value less than or equal to {0}"), "js", null, true);
        yield "'),
    min: \$.validator.format('";
        // line 105
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a value greater than or equal to {0}"), "js", null, true);
        yield "'),
    validationFunctionForDateTime: \$.validator.format('";
        // line 106
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid date or time"), "js", null, true);
        yield "'),
    validationFunctionForHex: \$.validator.format('";
        // line 107
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Please enter a valid HEX input"), "js", null, true);
        yield "'),
    validationFunctionForMd5: \$.validator.format('";
        // line 108
        $___internal_parse_32_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: To validate the usage of a MD5 function on the column
yield _gettext("This column can not contain a 32 chars value");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_32_, "js");
        yield "'),
    validationFunctionForAesDesEncrypt: \$.validator.format('";
        // line 109
        $___internal_parse_33_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
// l10n: To validate the usage of a AES_ENCRYPT/DES_ENCRYPT function on the column
yield _gettext("These functions are meant to return a binary result; to avoid inconsistent results you should store it in a BINARY, VARBINARY, or BLOB column.");
            return; yield '';
        })())) ? '' : new Markup($tmp, $this->env->getCharset());
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($___internal_parse_33_, "js");
        yield "')
  });
}
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "javascript/variables.twig";
    }

    /**
     * @codeCoverageIgnore
     */
    public function isTraitable()
    {
        return false;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  550 => 109,  541 => 108,  537 => 107,  533 => 106,  529 => 105,  525 => 104,  521 => 103,  517 => 102,  513 => 101,  509 => 100,  505 => 99,  501 => 98,  497 => 97,  493 => 96,  489 => 95,  485 => 94,  481 => 93,  477 => 92,  473 => 91,  469 => 90,  460 => 84,  456 => 83,  452 => 82,  448 => 81,  440 => 76,  436 => 75,  427 => 74,  417 => 72,  408 => 71,  399 => 70,  390 => 69,  381 => 68,  372 => 67,  363 => 66,  352 => 63,  343 => 62,  334 => 61,  325 => 60,  316 => 59,  307 => 58,  298 => 57,  292 => 54,  288 => 53,  284 => 52,  280 => 51,  276 => 50,  272 => 49,  268 => 48,  257 => 45,  248 => 44,  239 => 43,  230 => 42,  221 => 41,  212 => 40,  203 => 39,  194 => 38,  185 => 37,  176 => 36,  167 => 35,  158 => 34,  152 => 31,  148 => 30,  144 => 29,  140 => 28,  136 => 27,  132 => 26,  128 => 25,  124 => 24,  120 => 23,  116 => 22,  112 => 21,  108 => 20,  98 => 18,  89 => 17,  80 => 16,  71 => 15,  68 => 14,  62 => 10,  56 => 7,  51 => 5,  47 => 4,  43 => 3,  38 => 2,);
    }

    public function getSourceContext()
    {
        return new Source("", "javascript/variables.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\javascript\\variables.twig");
    }
}
