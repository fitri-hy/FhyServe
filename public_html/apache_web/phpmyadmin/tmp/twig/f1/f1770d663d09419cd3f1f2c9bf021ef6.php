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

/* navigation/main.twig */
class __TwigTemplate_2a19e15679d3c1a9ab5f9d144c0948c2 extends Template
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
        if ( !($context["is_ajax"] ?? null)) {
            // line 2
            yield "  <div id=\"pma_navigation\" class=\"d-print-none\" data-config-navigation-width=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["config_navigation_width"] ?? null), "html", null, true);
            yield "\">
    <div id=\"pma_navigation_resizer\"></div>
    <div id=\"pma_navigation_collapser\"></div>
    <div id=\"pma_navigation_content\">
      <div id=\"pma_navigation_header\">

        ";
            // line 8
            if (CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "is_displayed", [], "any", false, false, false, 8)) {
                // line 9
                yield "          <div id=\"pmalogo\">
            ";
                // line 10
                if (CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "has_link", [], "any", false, false, false, 10)) {
                    // line 11
                    yield "              <a href=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "link", [], "any", true, true, false, 11)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "link", [], "any", false, false, false, 11), "#")) : ("#")), "html", null, true);
                    yield "\"";
                    yield CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "attributes", [], "any", false, false, false, 11);
                    yield ">
            ";
                }
                // line 13
                yield "            ";
                if ( !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "source", [], "any", false, false, false, 13))) {
                    // line 14
                    yield "              <img id=\"imgpmalogo\" src=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "source", [], "any", false, false, false, 14), "html", null, true);
                    yield "\" alt=\"phpMyAdmin\">
            ";
                } else {
                    // line 16
                    yield "              <h1>phpMyAdmin</h1>
            ";
                }
                // line 18
                yield "            ";
                if (CoreExtension::getAttribute($this->env, $this->source, ($context["logo"] ?? null), "has_link", [], "any", false, false, false, 18)) {
                    // line 19
                    yield "              </a>
            ";
                }
                // line 21
                yield "          </div>
        ";
            }
            // line 23
            yield "
        <div id=\"navipanellinks\">
          <a href=\"";
            // line 25
            yield PhpMyAdmin\Url::getFromRoute("/");
            yield "\" title=\"";
yield _gettext("Home");
            yield "\">";
            // line 26
            yield PhpMyAdmin\Html\Generator::getImage("b_home", _gettext("Home"));
            // line 27
            yield "</a>

          ";
            // line 29
            if ((($context["server"] ?? null) != 0)) {
                // line 30
                yield "            <a class=\"logout disableAjax\" href=\"";
                yield PhpMyAdmin\Url::getFromRoute("/logout");
                yield "\" title=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((((($context["auth_type"] ?? null) == "config")) ? (_gettext("Empty session data")) : (_gettext("Log out"))), "html", null, true);
                yield "\">";
                // line 31
                yield PhpMyAdmin\Html\Generator::getImage("s_loggoff", (((($context["auth_type"] ?? null) == "config")) ? (_gettext("Empty session data")) : (_gettext("Log out"))));
                // line 32
                yield "</a>
          ";
            }
            // line 34
            yield "
          <a href=\"";
            // line 35
            yield PhpMyAdmin\Html\MySQLDocumentation::getDocumentationLink("index");
            yield "\" title=\"";
yield _gettext("phpMyAdmin documentation");
            yield "\" target=\"_blank\" rel=\"noopener noreferrer\">";
            // line 36
            yield PhpMyAdmin\Html\Generator::getImage("b_docs", _gettext("phpMyAdmin documentation"));
            // line 37
            yield "</a>

          <a href=\"";
            // line 39
            yield PhpMyAdmin\Util::getdocuURL(($context["is_mariadb"] ?? null));
            yield "\" title=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((($context["is_mariadb"] ?? null)) ? (_gettext("MariaDB Documentation")) : (_gettext("MySQL Documentation"))), "html", null, true);
            yield "\" target=\"_blank\" rel=\"noopener noreferrer\">";
            // line 40
            yield PhpMyAdmin\Html\Generator::getImage("b_sqlhelp", ((($context["is_mariadb"] ?? null)) ? (_gettext("MariaDB Documentation")) : (_gettext("MySQL Documentation"))));
            // line 41
            yield "</a>

          <a id=\"pma_navigation_settings_icon\"";
            // line 43
            yield (( !($context["is_navigation_settings_enabled"] ?? null)) ? (" class=\"hide\"") : (""));
            yield " href=\"#\" title=\"";
yield _gettext("Navigation panel settings");
            yield "\">";
            // line 44
            yield PhpMyAdmin\Html\Generator::getImage("s_cog", _gettext("Navigation panel settings"));
            // line 45
            yield "</a>

          <a id=\"pma_navigation_reload\" href=\"#\" title=\"";
yield _gettext("Reload navigation panel");
            // line 47
            yield "\">";
            // line 48
            yield PhpMyAdmin\Html\Generator::getImage("s_reload", _gettext("Reload navigation panel"));
            // line 49
            yield "</a>
        </div>

        ";
            // line 52
            if ((($context["is_servers_displayed"] ?? null) && (Twig\Extension\CoreExtension::length($this->env->getCharset(), ($context["servers"] ?? null)) > 1))) {
                // line 53
                yield "          <div id=\"serverChoice\">
            ";
                // line 54
                yield ($context["server_select"] ?? null);
                yield "
          </div>
        ";
            }
            // line 57
            yield "
        ";
            // line 58
            yield PhpMyAdmin\Html\Generator::getImage("ajax_clock_small", _gettext("Loading…"), ["style" => "visibility: hidden; display:none", "class" => "throbber"]);
            // line 61
            yield "
      </div>
      <div id=\"pma_navigation_tree\" class=\"list_container";
            // line 63
            yield ((($context["is_synced"] ?? null)) ? (" synced") : (""));
            yield ((($context["is_highlighted"] ?? null)) ? (" highlight") : (""));
            yield ((($context["is_autoexpanded"] ?? null)) ? (" autoexpand") : (""));
            yield "\">
";
        }
        // line 65
        yield "
";
        // line 66
        if ( !($context["navigation_tree"] ?? null)) {
            // line 67
            yield "  ";
            yield $this->env->getFilter('error')->getCallable()(_gettext("An error has occurred while loading the navigation display"));
            yield "
";
        } else {
            // line 69
            yield "  ";
            yield ($context["navigation_tree"] ?? null);
            yield "
";
        }
        // line 71
        yield "
";
        // line 72
        if ( !($context["is_ajax"] ?? null)) {
            // line 73
            yield "      </div>

      <div id=\"pma_navi_settings_container\">
        ";
            // line 76
            if (($context["is_navigation_settings_enabled"] ?? null)) {
                // line 77
                yield "          ";
                yield ($context["navigation_settings"] ?? null);
                yield "
        ";
            }
            // line 79
            yield "      </div>
    </div>

    ";
            // line 82
            if (($context["is_drag_drop_import_enabled"] ?? null)) {
                // line 83
                yield "      <div class=\"pma_drop_handler\">
        ";
yield _gettext("Drop files here");
                // line 85
                yield "      </div>
      <div class=\"pma_sql_import_status\">
        <h2>
          ";
yield _gettext("SQL upload");
                // line 89
                yield "          ( <span class=\"pma_import_count\">0</span> )
          <span class=\"close\">x</span>
          <span class=\"minimize\">-</span>
        </h2>
        <div></div>
      </div>
    ";
            }
            // line 96
            yield "  </div>
  ";
            // line 97
            yield Twig\Extension\CoreExtension::include($this->env, $context, "modals/unhide_nav_item.twig");
            yield "
  ";
            // line 98
            yield Twig\Extension\CoreExtension::include($this->env, $context, "modals/create_view.twig");
            yield "
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "navigation/main.twig";
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
        return array (  259 => 98,  255 => 97,  252 => 96,  243 => 89,  237 => 85,  233 => 83,  231 => 82,  226 => 79,  220 => 77,  218 => 76,  213 => 73,  211 => 72,  208 => 71,  202 => 69,  196 => 67,  194 => 66,  191 => 65,  184 => 63,  180 => 61,  178 => 58,  175 => 57,  169 => 54,  166 => 53,  164 => 52,  159 => 49,  157 => 48,  155 => 47,  150 => 45,  148 => 44,  143 => 43,  139 => 41,  137 => 40,  132 => 39,  128 => 37,  126 => 36,  121 => 35,  118 => 34,  114 => 32,  112 => 31,  106 => 30,  104 => 29,  100 => 27,  98 => 26,  93 => 25,  89 => 23,  85 => 21,  81 => 19,  78 => 18,  74 => 16,  68 => 14,  65 => 13,  57 => 11,  55 => 10,  52 => 9,  50 => 8,  40 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "navigation/main.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\navigation\\main.twig");
    }
}
