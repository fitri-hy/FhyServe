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

/* config/form_display/display.twig */
class __TwigTemplate_b96ad1238aa1abd503d2646aa7ae6b7b extends Template
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
        yield "<form method=\"post\" action=\"";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["action"] ?? null), "html_attr");
        yield "\" class=\"config-form disableAjax\">
  <input type=\"hidden\" name=\"tab_hash\" value=\"\">
  ";
        // line 3
        if (($context["has_check_page_refresh"] ?? null)) {
            // line 4
            yield "    <input type=\"hidden\" name=\"check_page_refresh\" id=\"check_page_refresh\" value=\"\">
  ";
        }
        // line 6
        yield "  ";
        yield PhpMyAdmin\Url::getHiddenInputs("", "", 0, "server");
        yield "
  ";
        // line 7
        yield PhpMyAdmin\Url::getHiddenFields(($context["hidden_fields"] ?? null), "", true);
        yield "

  <ul class=\"nav nav-tabs\" id=\"configFormDisplayTab\" role=\"tablist\">
    ";
        // line 10
        $context['_parent'] = $context;
        $context['_seq'] = CoreExtension::ensureTraversable(($context["tabs"] ?? null));
        $context['loop'] = [
          'parent' => $context['_parent'],
          'index0' => 0,
          'index'  => 1,
          'first'  => true,
        ];
        if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
            $length = count($context['_seq']);
            $context['loop']['revindex0'] = $length - 1;
            $context['loop']['revindex'] = $length;
            $context['loop']['length'] = $length;
            $context['loop']['last'] = 1 === $length;
        }
        foreach ($context['_seq'] as $context["id"] => $context["name"]) {
            // line 11
            yield "      <li class=\"nav-item\" role=\"presentation\">
        <a class=\"nav-link";
            // line 12
            yield ((CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 12)) ? (" active") : (""));
            yield "\" id=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["id"], "html", null, true);
            yield "-tab\" href=\"#";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["id"], "html", null, true);
            yield "\" data-bs-toggle=\"tab\" role=\"tab\" aria-controls=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["id"], "html", null, true);
            yield "\" aria-selected=\"";
            yield ((CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 12)) ? ("true") : ("false"));
            yield "\">";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["name"], "html", null, true);
            yield "</a>
      </li>
    ";
            ++$context['loop']['index0'];
            ++$context['loop']['index'];
            $context['loop']['first'] = false;
            if (isset($context['loop']['length'])) {
                --$context['loop']['revindex0'];
                --$context['loop']['revindex'];
                $context['loop']['last'] = 0 === $context['loop']['revindex0'];
            }
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['id'], $context['name'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 15
        yield "  </ul>
  <div class=\"tab-content\">
    ";
        // line 17
        $context['_parent'] = $context;
        $context['_seq'] = CoreExtension::ensureTraversable(($context["forms"] ?? null));
        $context['loop'] = [
          'parent' => $context['_parent'],
          'index0' => 0,
          'index'  => 1,
          'first'  => true,
        ];
        if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
            $length = count($context['_seq']);
            $context['loop']['revindex0'] = $length - 1;
            $context['loop']['revindex'] = $length;
            $context['loop']['length'] = $length;
            $context['loop']['last'] = 1 === $length;
        }
        foreach ($context['_seq'] as $context["_key"] => $context["form"]) {
            // line 18
            yield "      <div class=\"tab-pane fade";
            yield ((CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 18)) ? (" show active") : (""));
            yield "\" id=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["form"], "name", [], "any", false, false, false, 18), "html", null, true);
            yield "\" role=\"tabpanel\" aria-labelledby=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["form"], "name", [], "any", false, false, false, 18), "html", null, true);
            yield "-tab\">
        <div class=\"card border-top-0\">
          <div class=\"card-body\">
            <h5 class=\"card-title visually-hidden\">";
            // line 21
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, $context["form"], "descriptions", [], "any", false, false, false, 21), "name", [], "any", false, false, false, 21), "html", null, true);
            yield "</h5>
            ";
            // line 22
            if ( !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, $context["form"], "descriptions", [], "any", false, false, false, 22), "desc", [], "any", false, false, false, 22))) {
                // line 23
                yield "              <h6 class=\"card-subtitle mb-2 text-muted\">";
                yield CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, $context["form"], "descriptions", [], "any", false, false, false, 23), "desc", [], "any", false, false, false, 23);
                yield "</h6>
            ";
            }
            // line 25
            yield "
            <fieldset class=\"optbox\">
              <legend>";
            // line 27
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, $context["form"], "descriptions", [], "any", false, false, false, 27), "name", [], "any", false, false, false, 27), "html", null, true);
            yield "</legend>

              ";
            // line 30
            yield "              ";
            if ((is_iterable(CoreExtension::getAttribute($this->env, $this->source, $context["form"], "errors", [], "any", false, false, false, 30)) && (Twig\Extension\CoreExtension::length($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["form"], "errors", [], "any", false, false, false, 30)) > 0))) {
                // line 31
                yield "                <dl class=\"errors\">
                  ";
                // line 32
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, $context["form"], "errors", [], "any", false, false, false, 32));
                foreach ($context['_seq'] as $context["_key"] => $context["error"]) {
                    // line 33
                    yield "                    <dd>";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["error"], "html", null, true);
                    yield "</dd>
                  ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['error'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 35
                yield "                </dl>
              ";
            }
            // line 37
            yield "
              <table class=\"table table-borderless\">
                ";
            // line 39
            yield CoreExtension::getAttribute($this->env, $this->source, $context["form"], "fields_html", [], "any", false, false, false, 39);
            yield "
              </table>
            </fieldset>
          </div>

          ";
            // line 44
            if (($context["show_buttons"] ?? null)) {
                // line 45
                yield "            <div class=\"card-footer\">
              <input class=\"btn btn-primary\" type=\"submit\" name=\"submit_save\" value=\"";
yield _gettext("Apply");
                // line 46
                yield "\">
              <input class=\"btn btn-secondary\" type=\"button\" name=\"submit_reset\" value=\"";
yield _gettext("Reset");
                // line 47
                yield "\">
            </div>
          ";
            }
            // line 50
            yield "        </div>
      </div>
    ";
            ++$context['loop']['index0'];
            ++$context['loop']['index'];
            $context['loop']['first'] = false;
            if (isset($context['loop']['length'])) {
                --$context['loop']['revindex0'];
                --$context['loop']['revindex'];
                $context['loop']['last'] = 0 === $context['loop']['revindex0'];
            }
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['form'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 53
        yield "  </div>
</form>

<script type=\"text/javascript\">
  if (typeof configInlineParams === 'undefined' || !Array.isArray(configInlineParams)) {
    configInlineParams = [];
  }
  configInlineParams.push(function () {
    ";
        // line 61
        yield Twig\Extension\CoreExtension::join(($context["js_array"] ?? null), ";
");
        yield ";

    \$.extend(Messages, {
      'error_nan_p': '";
        // line 64
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Not a positive number!"), "js"), "html", null, true);
        yield "',
      'error_nan_nneg': '";
        // line 65
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Not a non-negative number!"), "js"), "html", null, true);
        yield "',
      'error_incorrect_port': '";
        // line 66
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Not a valid port number!"), "js"), "html", null, true);
        yield "',
      'error_invalid_value': '";
        // line 67
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Incorrect value!"), "js"), "html", null, true);
        yield "',
      'error_value_lte': '";
        // line 68
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(_gettext("Value must be less than or equal to %s!"), "js"), "html", null, true);
        yield "',
    });

    \$.extend(defaultValues, {
      ";
        // line 72
        yield Twig\Extension\CoreExtension::join(($context["js_default"] ?? null), ",
      ");
        yield "
    });
  });
  if (typeof configScriptLoaded !== 'undefined' && configInlineParams) {
    loadInlineConfig();
  }
</script>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "config/form_display/display.twig";
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
        return array (  267 => 72,  260 => 68,  256 => 67,  252 => 66,  248 => 65,  244 => 64,  237 => 61,  227 => 53,  211 => 50,  206 => 47,  202 => 46,  198 => 45,  196 => 44,  188 => 39,  184 => 37,  180 => 35,  171 => 33,  167 => 32,  164 => 31,  161 => 30,  156 => 27,  152 => 25,  146 => 23,  144 => 22,  140 => 21,  129 => 18,  112 => 17,  108 => 15,  81 => 12,  78 => 11,  61 => 10,  55 => 7,  50 => 6,  46 => 4,  44 => 3,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "config/form_display/display.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\config\\form_display\\display.twig");
    }
}
