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

/* header.twig */
class __TwigTemplate_e70c80f8706c079d0db05422087ef4bc extends Template
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
        // line 1
        yield "<!doctype html>
<html lang=\"";
        // line 2
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["lang"] ?? null), "html", null, true);
        yield "\" dir=\"";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["text_dir"] ?? null), "html", null, true);
        yield "\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <meta name=\"referrer\" content=\"same-origin\">
  <meta name=\"robots\" content=\"noindex,nofollow,notranslate\">
  <meta name=\"google\" content=\"notranslate\">
  ";
        // line 9
        if ( !($context["allow_third_party_framing"] ?? null)) {
            // line 10
            yield "<style id=\"cfs-style\">html{display: none;}</style>";
        }
        // line 12
        yield "
  <link rel=\"icon\" href=\"favicon.ico\" type=\"image/x-icon\">
  <link rel=\"shortcut icon\" href=\"favicon.ico\" type=\"image/x-icon\">
  <link rel=\"stylesheet\" type=\"text/css\" href=\"";
        // line 15
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["theme_path"] ?? null), "html", null, true);
        yield "/jquery/jquery-ui.css\">
  <link rel=\"stylesheet\" type=\"text/css\" href=\"";
        // line 16
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["base_dir"] ?? null), "html", null, true);
        yield "js/vendor/codemirror/lib/codemirror.css?";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["version"] ?? null), "html", null, true);
        yield "\">
  <link rel=\"stylesheet\" type=\"text/css\" href=\"";
        // line 17
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["base_dir"] ?? null), "html", null, true);
        yield "js/vendor/codemirror/addon/hint/show-hint.css?";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["version"] ?? null), "html", null, true);
        yield "\">
  <link rel=\"stylesheet\" type=\"text/css\" href=\"";
        // line 18
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["base_dir"] ?? null), "html", null, true);
        yield "js/vendor/codemirror/addon/lint/lint.css?";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["version"] ?? null), "html", null, true);
        yield "\">
  <link rel=\"stylesheet\" type=\"text/css\" href=\"";
        // line 19
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["theme_path"] ?? null), "html", null, true);
        yield "/css/theme";
        yield (((($context["text_dir"] ?? null) == "rtl")) ? (".rtl") : (""));
        yield ".css?";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["version"] ?? null), "html", null, true);
        yield "\">
  <title>";
        // line 20
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["title"] ?? null), "html", null, true);
        yield "</title>
  ";
        // line 21
        yield ($context["scripts"] ?? null);
        yield "
  <noscript><style>html{display:block}</style></noscript>
</head>
<body";
        // line 24
        (( !Twig\Extension\CoreExtension::testEmpty(($context["body_id"] ?? null))) ? (yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((" id=" . ($context["body_id"] ?? null)), "html", null, true)) : (yield ""));
        yield ">
  ";
        // line 25
        yield ($context["navigation"] ?? null);
        yield "
  ";
        // line 26
        yield ($context["custom_header"] ?? null);
        yield "
  ";
        // line 27
        yield ($context["load_user_preferences"] ?? null);
        yield "

  ";
        // line 29
        if ( !($context["show_hint"] ?? null)) {
            // line 30
            yield "    <span id=\"no_hint\" class=\"hide\"></span>
  ";
        }
        // line 32
        yield "
  ";
        // line 33
        if (($context["is_warnings_enabled"] ?? null)) {
            // line 34
            yield "    <noscript>
      ";
            // line 35
            yield $this->env->getFilter('error')->getCallable()(_gettext("Javascript must be enabled past this point!"));
            yield "
    </noscript>
  ";
        }
        // line 38
        yield "
  ";
        // line 39
        if ((($context["is_menu_enabled"] ?? null) && (($context["server"] ?? null) > 0))) {
            // line 40
            yield "    ";
            yield ($context["menu"] ?? null);
            yield "
    <span id=\"page_nav_icons\" class=\"d-print-none\">
      <span id=\"lock_page_icon\"></span>
      <span id=\"page_settings_icon\">
        ";
            // line 44
            yield PhpMyAdmin\Html\Generator::getImage("s_cog", _gettext("Page-related settings"));
            yield "
      </span>
      <a id=\"goto_pagetop\" href=\"#\">";
            // line 46
            yield PhpMyAdmin\Html\Generator::getImage("s_top", _gettext("Click on the bar to scroll to top of page"));
            yield "</a>
    </span>
  ";
        }
        // line 49
        yield "
  ";
        // line 50
        yield ($context["console"] ?? null);
        yield "

  <div id=\"page_content\">
    ";
        // line 53
        yield ($context["messages"] ?? null);
        yield "

    ";
        // line 55
        yield ($context["recent_table"] ?? null);
        // line 56
        if (($context["is_logged_in"] ?? null)) {
            // line 57
            yield Twig\Extension\CoreExtension::include($this->env, $context, "modals/preview_sql_modal.twig");
            yield "
    ";
            // line 58
            yield Twig\Extension\CoreExtension::include($this->env, $context, "modals/enum_set_editor.twig");
            yield "
    ";
            // line 59
            yield Twig\Extension\CoreExtension::include($this->env, $context, "modals/create_view.twig");
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "header.twig";
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
        return array (  190 => 59,  186 => 58,  182 => 57,  180 => 56,  178 => 55,  173 => 53,  167 => 50,  164 => 49,  158 => 46,  153 => 44,  145 => 40,  143 => 39,  140 => 38,  134 => 35,  131 => 34,  129 => 33,  126 => 32,  122 => 30,  120 => 29,  115 => 27,  111 => 26,  107 => 25,  103 => 24,  97 => 21,  93 => 20,  85 => 19,  79 => 18,  73 => 17,  67 => 16,  63 => 15,  58 => 12,  55 => 10,  53 => 9,  41 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "header.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\header.twig");
    }
}
