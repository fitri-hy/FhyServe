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

/* navigation/tree/node.twig */
class __TwigTemplate_f0a191bdd1e7a4502cfd31aabbd21d3d extends Template
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
        if (($context["show_node"] ?? null)) {
            // line 2
            yield "  <li class=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["li_classes"] ?? null), "html", null, true);
            yield "\">
    <div class=\"block\">
      <i";
            // line 4
            yield (((($context["class"] ?? null) == "first")) ? (" class=\"first\"") : (""));
            yield "></i>
      ";
            // line 5
            if (($context["node_is_group"] ?? null)) {
                // line 6
                yield "        ";
                yield ((!CoreExtension::inFilter("last", ($context["class"] ?? null))) ? ("<b></b>") : (""));
                yield "
        <a class=\"";
                // line 7
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["link_classes"] ?? null), "html", null, true);
                yield "\" href=\"#\">
          <span class=\"hide paths_nav\" data-apath=\"";
                // line 8
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["paths"] ?? null), "a_path", [], "any", false, false, false, 8), "html", null, true);
                yield "\" data-vpath=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["paths"] ?? null), "v_path", [], "any", false, false, false, 8), "html", null, true);
                yield "\" data-pos=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["paths"] ?? null), "pos", [], "any", false, false, false, 8), "html", null, true);
                yield "\"></span>
          ";
                // line 9
                if ( !Twig\Extension\CoreExtension::testEmpty(($context["pagination_params"] ?? null))) {
                    // line 10
                    yield "            <span class=\"hide ";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "position", [], "any", false, false, false, 10), "html", null, true);
                    yield "\" data-name=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_name", [], "any", false, false, false, 10), "html", null, true);
                    yield "\" data-value=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_value", [], "any", false, false, false, 10), "html", null, true);
                    yield "\"></span>
          ";
                }
                // line 12
                yield "          ";
                yield ($context["node_icon"] ?? null);
                yield "
        </a>
      ";
            } elseif ( !Twig\Extension\CoreExtension::testEmpty(            // line 14
($context["pagination_params"] ?? null))) {
                // line 15
                yield "        <span class=\"hide ";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "position", [], "any", false, false, false, 15), "html", null, true);
                yield "\" data-name=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_name", [], "any", false, false, false, 15), "html", null, true);
                yield "\" data-value=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_value", [], "any", false, false, false, 15), "html", null, true);
                yield "\"></span>
      ";
            }
            // line 17
            yield "    </div>
    ";
            // line 18
            if (($context["node_is_container"] ?? null)) {
                // line 19
                yield "      <div class=\"fst-italic\">
    ";
            }
            // line 21
            yield "
    ";
            // line 22
            if (CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "isGroup", [], "any", false, false, false, 22)) {
                // line 23
                yield "      <div class=\"block second";
                yield ((($context["has_second_icon"] ?? null)) ? (" double") : (""));
                yield "\">
        <u>";
                // line 24
                yield PhpMyAdmin\Html\Generator::getImage((($__internal_compile_0 = CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "icon", [], "any", false, false, false, 24)) && is_array($__internal_compile_0) || $__internal_compile_0 instanceof ArrayAccess ? ($__internal_compile_0["image"] ?? null) : null), (($__internal_compile_1 = CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "icon", [], "any", false, false, false, 24)) && is_array($__internal_compile_1) || $__internal_compile_1 instanceof ArrayAccess ? ($__internal_compile_1["title"] ?? null) : null));
                yield "</u>
      </div>
      &nbsp;";
                // line 26
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "name", [], "any", false, false, false, 26), "html", null, true);
                yield "
    ";
            } else {
                // line 28
                yield "      <div class=\"block second";
                yield ((($context["has_second_icon"] ?? null)) ? (" double") : (""));
                yield "\">
        ";
                // line 29
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(($context["icon_links"] ?? null));
                foreach ($context['_seq'] as $context["_key"] => $context["link"]) {
                    // line 30
                    yield "          <a href=\"";
                    yield PhpMyAdmin\Url::getFromRoute(CoreExtension::getAttribute($this->env, $this->source, $context["link"], "route", [], "any", false, false, false, 30), CoreExtension::getAttribute($this->env, $this->source, $context["link"], "params", [], "any", false, false, false, 30));
                    yield "\"";
                    yield ((CoreExtension::getAttribute($this->env, $this->source, $context["link"], "is_ajax", [], "any", false, false, false, 30)) ? (" class=\"ajax\"") : (""));
                    yield ">";
                    // line 31
                    yield PhpMyAdmin\Html\Generator::getImage(CoreExtension::getAttribute($this->env, $this->source, $context["link"], "image", [], "any", false, false, false, 31), CoreExtension::getAttribute($this->env, $this->source, $context["link"], "title", [], "any", false, false, false, 31));
                    // line 32
                    yield "</a>
        ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['link'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 34
                yield "      </div>

      ";
                // line 36
                if (($context["node_is_container"] ?? null)) {
                    // line 37
                    yield "        &nbsp;<a class=\"hover_show_full\" href=\"";
                    yield PhpMyAdmin\Url::getFromRoute(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "route", [], "any", false, false, false, 37), CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "params", [], "any", false, false, false, 37));
                    yield "\">";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "name", [], "any", false, false, false, 37), "html", null, true);
                    yield "</a>
      ";
                } elseif (CoreExtension::inFilter("index", CoreExtension::getAttribute($this->env, $this->source,                 // line 38
($context["node"] ?? null), "classes", [], "any", false, false, false, 38))) {
                    // line 39
                    yield "        <a class=\"hover_show_full\" href=\"";
                    yield PhpMyAdmin\Url::getFromRoute(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "route", [], "any", false, false, false, 39));
                    yield "\" data-post=\"";
                    yield PhpMyAdmin\Url::getCommon(Twig\Extension\CoreExtension::merge(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "params", [], "any", false, false, false, 39), ["is_from_nav" => true]));
                    yield "\" title=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "title", [], "any", false, false, false, 39), "html", null, true);
                    yield "\">";
                    // line 40
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((((CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", true, true, false, 40) &&  !(null === CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", false, false, false, 40)))) ? (CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", false, false, false, 40)) : (CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "realName", [], "any", false, false, false, 40))), "html", null, true);
                    // line 41
                    yield "</a>
      ";
                } else {
                    // line 43
                    yield "        <a class=\"hover_show_full";
                    yield ((CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "is_ajax", [], "any", false, false, false, 43)) ? (" ajax") : (""));
                    yield "\" href=\"";
                    yield PhpMyAdmin\Url::getFromRoute(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "route", [], "any", false, false, false, 43), CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "params", [], "any", false, false, false, 43));
                    yield "\" title=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["text_link"] ?? null), "title", [], "any", false, false, false, 43), "html", null, true);
                    yield "\">";
                    // line 44
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((((CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", true, true, false, 44) &&  !(null === CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", false, false, false, 44)))) ? (CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "displayName", [], "any", false, false, false, 44)) : (CoreExtension::getAttribute($this->env, $this->source, ($context["node"] ?? null), "realName", [], "any", false, false, false, 44))), "html", null, true);
                    // line 45
                    yield "</a>
      ";
                }
                // line 47
                yield "    ";
            }
            // line 48
            yield "
    ";
            // line 49
            yield ($context["control_buttons"] ?? null);
            yield "

    ";
            // line 51
            if (($context["node_is_container"] ?? null)) {
                // line 52
                yield "      </div>
    ";
            }
            // line 54
            yield "
    <div class=\"clearfloat\"></div>
";
        } elseif ( !Twig\Extension\CoreExtension::testEmpty(        // line 56
($context["pagination_params"] ?? null))) {
            // line 57
            yield "  <span class=\"hide ";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "position", [], "any", false, false, false, 57), "html", null, true);
            yield "\" data-name=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_name", [], "any", false, false, false, 57), "html", null, true);
            yield "\" data-value=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, ($context["pagination_params"] ?? null), "data_value", [], "any", false, false, false, 57), "html", null, true);
            yield "\"></span>
";
        }
        // line 59
        yield "
";
        // line 60
        if (( !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "html", [], "any", false, false, false, 60)) && CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "has_wrapper", [], "any", false, false, false, 60))) {
            // line 61
            yield "  <div class=\"list_container\"";
            yield ((CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "is_hidden", [], "any", false, false, false, 61)) ? (" style=\"display: none;\"") : (""));
            yield ">
    <ul>
";
        }
        // line 64
        yield CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "html", [], "any", false, false, false, 64);
        yield "
";
        // line 65
        if (( !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "html", [], "any", false, false, false, 65)) && CoreExtension::getAttribute($this->env, $this->source, ($context["recursive"] ?? null), "has_wrapper", [], "any", false, false, false, 65))) {
            // line 66
            yield "    </ul>
  </div>
";
        }
        // line 69
        yield "
";
        // line 70
        if (($context["has_siblings"] ?? null)) {
            // line 71
            yield "  </li>
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "navigation/tree/node.twig";
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
        return array (  256 => 71,  254 => 70,  251 => 69,  246 => 66,  244 => 65,  240 => 64,  233 => 61,  231 => 60,  228 => 59,  218 => 57,  216 => 56,  212 => 54,  208 => 52,  206 => 51,  201 => 49,  198 => 48,  195 => 47,  191 => 45,  189 => 44,  181 => 43,  177 => 41,  175 => 40,  167 => 39,  165 => 38,  158 => 37,  156 => 36,  152 => 34,  145 => 32,  143 => 31,  137 => 30,  133 => 29,  128 => 28,  123 => 26,  118 => 24,  113 => 23,  111 => 22,  108 => 21,  104 => 19,  102 => 18,  99 => 17,  89 => 15,  87 => 14,  81 => 12,  71 => 10,  69 => 9,  61 => 8,  57 => 7,  52 => 6,  50 => 5,  46 => 4,  40 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "navigation/tree/node.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\navigation\\tree\\node.twig");
    }
}
