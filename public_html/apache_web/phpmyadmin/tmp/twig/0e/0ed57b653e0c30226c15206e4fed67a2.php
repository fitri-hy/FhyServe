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

/* console/display.twig */
class __TwigTemplate_9fd9424a66e27e15396fff6d190dab6e extends Template
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
        yield "<div id=\"pma_console_container\" class=\"d-print-none\">
    <div id=\"pma_console\">
        ";
        // line 4
        yield "        ";
        yield from         $this->loadTemplate("console/toolbar.twig", "console/display.twig", 4)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "collapsed", "content_array" => [["switch_button console_switch", _gettext("Console"), "image" =>         // line 7
($context["image"] ?? null)], ["button clear", _gettext("Clear")], ["button history", _gettext("History")], ["button options", _gettext("Options")], ((        // line 11
($context["has_bookmark_feature"] ?? null)) ? (["button bookmarks", _gettext("Bookmarks")]) : (null)), ["button debug hide", _gettext("Debug SQL")]]]));
        // line 15
        yield "        ";
        // line 16
        yield "        <div class=\"content\">
            <div class=\"console_message_container\">
                <div class=\"message welcome\">
                    <span id=\"instructions-0\">
                        ";
yield _gettext("Press Ctrl+Enter to execute query");
        // line 21
        yield "                    </span>
                    <span class=\"hide\" id=\"instructions-1\">
                        ";
yield _gettext("Press Enter to execute query");
        // line 24
        yield "                    </span>
                </div>
                ";
        // line 26
        if ( !Twig\Extension\CoreExtension::testEmpty(($context["sql_history"] ?? null))) {
            // line 27
            yield "                    ";
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(Twig\Extension\CoreExtension::reverse($this->env->getCharset(), ($context["sql_history"] ?? null)));
            foreach ($context['_seq'] as $context["_key"] => $context["record"]) {
                // line 28
                yield "                        <div class=\"message history collapsed hide";
                // line 29
                yield ((CoreExtension::matches("@^SELECT[[:space:]]+@i", (($__internal_compile_0 = $context["record"]) && is_array($__internal_compile_0) || $__internal_compile_0 instanceof ArrayAccess ? ($__internal_compile_0["sqlquery"] ?? null) : null))) ? (" select") : (""));
                yield "\"
                            targetdb=\"";
                // line 30
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((($__internal_compile_1 = $context["record"]) && is_array($__internal_compile_1) || $__internal_compile_1 instanceof ArrayAccess ? ($__internal_compile_1["db"] ?? null) : null), "html", null, true);
                yield "\" targettable=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((($__internal_compile_2 = $context["record"]) && is_array($__internal_compile_2) || $__internal_compile_2 instanceof ArrayAccess ? ($__internal_compile_2["table"] ?? null) : null), "html", null, true);
                yield "\">
                            ";
                // line 31
                yield from                 $this->loadTemplate("console/query_action.twig", "console/display.twig", 31)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "action_content", "content_array" => [["action collapse", _gettext("Collapse")], ["action expand", _gettext("Expand")], ["action requery", _gettext("Requery")], ["action edit", _gettext("Edit")], ["action explain", _gettext("Explain")], ["action profiling", _gettext("Profiling")], ((                // line 40
($context["has_bookmark_feature"] ?? null)) ? (["action bookmark", _gettext("Bookmark")]) : (null)), ["text failed", _gettext("Query failed")], ["text targetdb", _gettext("Database"), "extraSpan" => (($__internal_compile_3 =                 // line 42
$context["record"]) && is_array($__internal_compile_3) || $__internal_compile_3 instanceof ArrayAccess ? ($__internal_compile_3["db"] ?? null) : null)], ["text query_time", _gettext("Queried time"), "extraSpan" => ((CoreExtension::getAttribute($this->env, $this->source,                 // line 46
$context["record"], "timevalue", [], "array", true, true, false, 46)) ? ((($__internal_compile_4 =                 // line 47
$context["record"]) && is_array($__internal_compile_4) || $__internal_compile_4 instanceof ArrayAccess ? ($__internal_compile_4["timevalue"] ?? null) : null)) : (_gettext("During current session")))]]]));
                // line 51
                yield "                            <span class=\"query\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((($__internal_compile_5 = $context["record"]) && is_array($__internal_compile_5) || $__internal_compile_5 instanceof ArrayAccess ? ($__internal_compile_5["sqlquery"] ?? null) : null), "html", null, true);
                yield "</span>
                        </div>
                    ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['record'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 54
            yield "                ";
        }
        // line 55
        yield "            </div><!-- console_message_container -->
            <div class=\"query_input\">
                <span class=\"console_query_input\"></span>
            </div>
        </div><!-- message end -->
        ";
        // line 61
        yield "        <div class=\"mid_layer\"></div>
        ";
        // line 63
        yield "        <div class=\"card\" id=\"debug_console\">
            ";
        // line 64
        yield from         $this->loadTemplate("console/toolbar.twig", "console/display.twig", 64)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "", "content_array" => [["button order order_asc", _gettext("ascending")], ["button order order_desc", _gettext("descending")], ["text", _gettext("Order:")], ["switch_button", _gettext("Debug SQL")], ["button order_by sort_count", _gettext("Count")], ["button order_by sort_exec", _gettext("Execution order")], ["button order_by sort_time", _gettext("Time taken")], ["text", _gettext("Order by:")], ["button group_queries", _gettext("Group queries")], ["button ungroup_queries", _gettext("Ungroup queries")]]]));
        // line 79
        yield "            <div class=\"content debug\">
                <div class=\"message welcome\"></div>
                <div class=\"debugLog\"></div>
            </div> <!-- Content -->
            <div class=\"templates\">
                ";
        // line 84
        yield from         $this->loadTemplate("console/query_action.twig", "console/display.twig", 84)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "debug_query action_content", "content_array" => [["action collapse", _gettext("Collapse")], ["action expand", _gettext("Expand")], ["action dbg_show_trace", _gettext("Show trace")], ["action dbg_hide_trace", _gettext("Hide trace")], ["text count hide", _gettext("Count"), "extraSpan" => ""], ["text time", _gettext("Time taken"), "extraSpan" => ""]]]));
        // line 95
        yield "            </div> <!-- Template -->
        </div> <!-- Debug SQL card -->
        ";
        // line 97
        if (($context["has_bookmark_feature"] ?? null)) {
            // line 98
            yield "            <div class=\"card\" id=\"pma_bookmarks\">
                ";
            // line 99
            yield from             $this->loadTemplate("console/toolbar.twig", "console/display.twig", 99)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "", "content_array" => [["switch_button", _gettext("Bookmarks")], ["button refresh", _gettext("Refresh")], ["button add", _gettext("Add")]]]));
            // line 107
            yield "                <div class=\"content bookmark\">
                    ";
            // line 108
            yield ($context["bookmark_content"] ?? null);
            yield "
                </div>
                <div class=\"mid_layer\"></div>
                <div class=\"card add\">
                    ";
            // line 112
            yield from             $this->loadTemplate("console/toolbar.twig", "console/display.twig", 112)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "", "content_array" => [["switch_button", _gettext("Add bookmark")]]]));
            // line 118
            yield "                    <div class=\"content add_bookmark\">
                        <div class=\"options\">
                            <label>
                                ";
yield _gettext("Label");
            // line 121
            yield ": <input type=\"text\" name=\"label\">
                            </label>
                            <label>
                                ";
yield _gettext("Target database");
            // line 124
            yield ": <input type=\"text\" name=\"targetdb\">
                            </label>
                            <label>
                                <input type=\"checkbox\" name=\"shared\">";
yield _gettext("Share this bookmark");
            // line 128
            yield "                            </label>
                            <button class=\"btn btn-primary\" type=\"submit\" name=\"submit\">";
yield _gettext("OK");
            // line 129
            yield "</button>
                        </div> <!-- options -->
                        <div class=\"query_input\">
                            <span class=\"bookmark_add_input\"></span>
                        </div>
                    </div>
                </div> <!-- Add bookmark card -->
            </div> <!-- Bookmarks card -->
        ";
        }
        // line 138
        yield "        ";
        // line 139
        yield "        <div class=\"card\" id=\"pma_console_options\">
            ";
        // line 140
        yield from         $this->loadTemplate("console/toolbar.twig", "console/display.twig", 140)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "", "content_array" => [["switch_button", _gettext("Options")], ["button default", _gettext("Set default")]]]));
        // line 147
        yield "            <div class=\"content\">
                <label>
                    <input type=\"checkbox\" name=\"always_expand\">";
yield _gettext("Always expand query messages");
        // line 150
        yield "                </label>
                <br>
                <label>
                    <input type=\"checkbox\" name=\"start_history\">";
yield _gettext("Show query history at start");
        // line 154
        yield "                </label>
                <br>
                <label>
                    <input type=\"checkbox\" name=\"current_query\">";
yield _gettext("Show current browsing query");
        // line 158
        yield "                </label>
                <br>
                <label>
                    <input type=\"checkbox\" name=\"enter_executes\">
                        ";
yield _gettext("Execute queries on Enter and insert new line with Shift+Enter. To make this permanent, view settings.");
        // line 165
        yield "                </label>
                <br>
                <label>
                    <input type=\"checkbox\" name=\"dark_theme\">";
yield _gettext("Switch to dark theme");
        // line 169
        yield "                </label>
                <br>
            </div>
        </div> <!-- Options card -->
        <div class=\"templates\">
            ";
        // line 175
        yield "            ";
        yield from         $this->loadTemplate("console/query_action.twig", "console/display.twig", 175)->unwrap()->yield(CoreExtension::toArray(["parent_div_classes" => "query_actions", "content_array" => [["action collapse", _gettext("Collapse")], ["action expand", _gettext("Expand")], ["action requery", _gettext("Requery")], ["action edit", _gettext("Edit")], ["action explain", _gettext("Explain")], ["action profiling", _gettext("Profiling")], ((        // line 184
($context["has_bookmark_feature"] ?? null)) ? (["action bookmark", _gettext("Bookmark")]) : (null)), ["text failed", _gettext("Query failed")], ["text targetdb", _gettext("Database"), "extraSpan" => ""], ["text query_time", _gettext("Queried time"), "extraSpan" => ""]]]));
        // line 190
        yield "        </div>
    </div> <!-- #console end -->
</div> <!-- #console_container end -->
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "console/display.twig";
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
        return array (  231 => 190,  229 => 184,  227 => 175,  220 => 169,  214 => 165,  207 => 158,  201 => 154,  195 => 150,  190 => 147,  188 => 140,  185 => 139,  183 => 138,  172 => 129,  168 => 128,  162 => 124,  156 => 121,  150 => 118,  148 => 112,  141 => 108,  138 => 107,  136 => 99,  133 => 98,  131 => 97,  127 => 95,  125 => 84,  118 => 79,  116 => 64,  113 => 63,  110 => 61,  103 => 55,  100 => 54,  90 => 51,  88 => 47,  87 => 46,  86 => 42,  85 => 40,  84 => 31,  78 => 30,  74 => 29,  72 => 28,  67 => 27,  65 => 26,  61 => 24,  56 => 21,  49 => 16,  47 => 15,  45 => 11,  44 => 7,  42 => 4,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "console/display.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\console\\display.twig");
    }
}
