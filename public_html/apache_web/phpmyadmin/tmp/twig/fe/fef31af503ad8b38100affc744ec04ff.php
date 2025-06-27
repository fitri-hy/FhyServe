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

/* list_navigator.twig */
class __TwigTemplate_9025260da388efe73709212f37864a37 extends Template
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
        if ((($context["max_count"] ?? null) < ($context["count"] ?? null))) {
            // line 2
            yield "<div class=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::join(($context["classes"] ?? null), " "), "html", null, true);
            yield "\">
  ";
            // line 3
            if ((($context["frame"] ?? null) != "frame_navigation")) {
                // line 4
                yield "    ";
yield _gettext("Page number:");
                // line 5
                yield "  ";
            }
            // line 6
            yield "
  ";
            // line 7
            if ((($context["position"] ?? null) > 0)) {
                // line 8
                yield "    <a href=\"";
                yield ($context["script"] ?? null);
                yield "\" data-post=\"";
                yield PhpMyAdmin\Url::getCommon(Twig\Extension\CoreExtension::merge(($context["url_params"] ?? null), [($context["param_name"] ?? null) => 0]), "", false);
                yield "\"";
                yield (((($context["frame"] ?? null) == "frame_navigation")) ? (" class=\"ajax\"") : (""));
                yield " title=\"";
yield _pgettext("First page", "Begin");
                yield "\">
      ";
                // line 9
                if (PhpMyAdmin\Util::showIcons("TableNavigationLinksMode")) {
                    // line 10
                    yield "        &lt;&lt;
      ";
                }
                // line 12
                yield "      ";
                if (PhpMyAdmin\Util::showText("TableNavigationLinksMode")) {
                    // line 13
                    yield "        ";
yield _pgettext("First page", "Begin");
                    // line 14
                    yield "      ";
                }
                // line 15
                yield "    </a>
    <a href=\"";
                // line 16
                yield ($context["script"] ?? null);
                yield "\" data-post=\"";
                yield PhpMyAdmin\Url::getCommon(Twig\Extension\CoreExtension::merge(($context["url_params"] ?? null), [($context["param_name"] ?? null) => (($context["position"] ?? null) - ($context["max_count"] ?? null))]), "", false);
                yield "\"";
                yield (((($context["frame"] ?? null) == "frame_navigation")) ? (" class=\"ajax\"") : (""));
                yield " title=\"";
yield _pgettext("Previous page", "Previous");
                yield "\">
      ";
                // line 17
                if (PhpMyAdmin\Util::showIcons("TableNavigationLinksMode")) {
                    // line 18
                    yield "        &lt;
      ";
                }
                // line 20
                yield "      ";
                if (PhpMyAdmin\Util::showText("TableNavigationLinksMode")) {
                    // line 21
                    yield "        ";
yield _pgettext("Previous page", "Previous");
                    // line 22
                    yield "      ";
                }
                // line 23
                yield "    </a>
  ";
            }
            // line 25
            yield "
  <form action=\"";
            // line 26
            yield ($context["script"] ?? null);
            yield "\" method=\"post\">
    ";
            // line 27
            yield PhpMyAdmin\Url::getHiddenInputs(($context["url_params"] ?? null));
            yield "

    ";
            // line 29
            yield ($context["page_selector"] ?? null);
            yield "
  </form>

  ";
            // line 32
            if (((($context["position"] ?? null) + ($context["max_count"] ?? null)) < ($context["count"] ?? null))) {
                // line 33
                yield "    <a href=\"";
                yield ($context["script"] ?? null);
                yield "\" data-post=\"";
                yield PhpMyAdmin\Url::getCommon(Twig\Extension\CoreExtension::merge(($context["url_params"] ?? null), [($context["param_name"] ?? null) => (($context["position"] ?? null) + ($context["max_count"] ?? null))]), "", false);
                yield "\"";
                yield (((($context["frame"] ?? null) == "frame_navigation")) ? (" class=\"ajax\"") : (""));
                yield " title=\"";
yield _pgettext("Next page", "Next");
                yield "\">
      ";
                // line 34
                if (PhpMyAdmin\Util::showText("TableNavigationLinksMode")) {
                    // line 35
                    yield "        ";
yield _pgettext("Next page", "Next");
                    // line 36
                    yield "      ";
                }
                // line 37
                yield "      ";
                if (PhpMyAdmin\Util::showIcons("TableNavigationLinksMode")) {
                    // line 38
                    yield "        &gt;
      ";
                }
                // line 40
                yield "    </a>
    ";
                // line 41
                $context["last_pos"] = ((int) floor((($context["count"] ?? null) / ($context["max_count"] ?? null))) * ($context["max_count"] ?? null));
                // line 42
                yield "    <a href=\"";
                yield ($context["script"] ?? null);
                yield "\" data-post=\"";
                yield PhpMyAdmin\Url::getCommon(Twig\Extension\CoreExtension::merge(($context["url_params"] ?? null), [($context["param_name"] ?? null) => (((($context["last_pos"] ?? null) == ($context["count"] ?? null))) ? ((($context["count"] ?? null) - ($context["max_count"] ?? null))) : (($context["last_pos"] ?? null)))]), "", false);
                yield "\"";
                yield (((($context["frame"] ?? null) == "frame_navigation")) ? (" class=\"ajax\"") : (""));
                yield " title=\"";
yield _pgettext("Last page", "End");
                yield "\">
      ";
                // line 43
                if (PhpMyAdmin\Util::showText("TableNavigationLinksMode")) {
                    // line 44
                    yield "        ";
yield _pgettext("Last page", "End");
                    // line 45
                    yield "      ";
                }
                // line 46
                yield "      ";
                if (PhpMyAdmin\Util::showIcons("TableNavigationLinksMode")) {
                    // line 47
                    yield "        &gt;&gt;
      ";
                }
                // line 49
                yield "    </a>
  ";
            }
            // line 51
            yield "</div>
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "list_navigator.twig";
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
        return array (  197 => 51,  193 => 49,  189 => 47,  186 => 46,  183 => 45,  180 => 44,  178 => 43,  167 => 42,  165 => 41,  162 => 40,  158 => 38,  155 => 37,  152 => 36,  149 => 35,  147 => 34,  136 => 33,  134 => 32,  128 => 29,  123 => 27,  119 => 26,  116 => 25,  112 => 23,  109 => 22,  106 => 21,  103 => 20,  99 => 18,  97 => 17,  87 => 16,  84 => 15,  81 => 14,  78 => 13,  75 => 12,  71 => 10,  69 => 9,  58 => 8,  56 => 7,  53 => 6,  50 => 5,  47 => 4,  45 => 3,  40 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "list_navigator.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\list_navigator.twig");
    }
}
