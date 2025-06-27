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

/* login/form.twig */
class __TwigTemplate_8f7344c2b7bfb110d3640e1721abb11d extends Template
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
        yield ($context["login_header"] ?? null);
        yield "

";
        // line 3
        if (($context["is_demo"] ?? null)) {
            // line 4
            yield "  <div class=\"card mb-4\">
    <div class=\"card-header\">";
yield _gettext("phpMyAdmin Demo Server");
            // line 5
            yield "</div>
    <div class=\"card-body\">
      ";
            // line 7
            $___internal_parse_0_ = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                // line 8
                yield "        ";
yield _gettext("You are using the demo server. You can do anything here, but please do not change root, debian-sys-maint and pma users. More information is available at %s.");
                // line 11
                yield "      ";
                return; yield '';
            })())) ? '' : new Markup($tmp, $this->env->getCharset());
            // line 7
            yield Twig\Extension\CoreExtension::sprintf($___internal_parse_0_, "<a href=\"url.php?url=https://demo.phpmyadmin.net/\" target=\"_blank\" rel=\"noopener noreferrer\">demo.phpmyadmin.net</a>");
            // line 12
            yield "    </div>
  </div>
";
        }
        // line 15
        yield "
";
        // line 16
        yield ($context["error_messages"] ?? null);
        yield "

";
        // line 18
        if ( !Twig\Extension\CoreExtension::testEmpty(($context["available_languages"] ?? null))) {
            // line 19
            yield "  <div class='hide js-show'>
    <div class=\"card mb-4\">
      <div class=\"card-header\">
        <span id=\"languageSelectLabel\">
          ";
yield _gettext("Language");
            // line 24
            yield "          ";
            if ((_gettext("Language") != "Language")) {
                // line 25
                yield "                        <i lang=\"en\" dir=\"ltr\">(Language)</i>
          ";
            }
            // line 29
            yield "        </span>
      </div>
      <div class=\"card-body\">
        <form method=\"get\" action=\"";
            // line 32
            yield PhpMyAdmin\Url::getFromRoute("/");
            yield "\" class=\"disableAjax\">
          ";
            // line 33
            yield PhpMyAdmin\Url::getHiddenInputs(($context["form_params"] ?? null));
            yield "
          <select name=\"lang\" class=\"form-select autosubmit\" lang=\"en\" dir=\"ltr\" id=\"languageSelect\" aria-labelledby=\"languageSelectLabel\">
            ";
            // line 35
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(($context["available_languages"] ?? null));
            foreach ($context['_seq'] as $context["_key"] => $context["language"]) {
                // line 36
                yield "              <option value=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::lower($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["language"], "getCode", [], "method", false, false, false, 36)), "html", null, true);
                yield "\"";
                yield ((CoreExtension::getAttribute($this->env, $this->source, $context["language"], "isActive", [], "method", false, false, false, 36)) ? (" selected") : (""));
                yield ">";
                // line 37
                yield CoreExtension::getAttribute($this->env, $this->source, $context["language"], "getName", [], "method", false, false, false, 37);
                // line 38
                yield "</option>
            ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['language'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 40
            yield "          </select>
        </form>
      </div>
    </div>
  </div>
";
        }
        // line 46
        yield "
<form method=\"post\" id=\"login_form\" action=\"index.php?route=/\" name=\"login_form\" class=\"";
        // line 48
        yield (( !($context["is_session_expired"] ?? null)) ? ("disableAjax hide ") : (""));
        yield "js-show\"";
        yield (( !($context["has_autocomplete"] ?? null)) ? (" autocomplete=\"off\"") : (""));
        yield ">
  ";
        // line 50
        yield "  ";
        yield PhpMyAdmin\Url::getHiddenInputs(($context["form_params"] ?? null), "", 0, "server");
        yield "
  <input type=\"hidden\" name=\"set_session\" value=\"";
        // line 51
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["session_id"] ?? null), "html", null, true);
        yield "\">
  ";
        // line 52
        if (($context["is_session_expired"] ?? null)) {
            // line 53
            yield "    <input type=\"hidden\" name=\"session_timedout\" value=\"1\">
  ";
        }
        // line 55
        yield "
  <div class=\"card mb-4\">
    <div class=\"card-header\">
      ";
yield _gettext("Log in");
        // line 59
        yield "      ";
        yield PhpMyAdmin\Html\MySQLDocumentation::showDocumentation("index");
        yield "
    </div>
    <div class=\"card-body\">
      ";
        // line 62
        if (($context["is_arbitrary_server_allowed"] ?? null)) {
            // line 63
            yield "        <div class=\"row mb-3\">
          <label for=\"serverNameInput\" class=\"col-sm-4 col-form-label\" title=\"";
yield _gettext("You can enter hostname/IP address and port separated by space.");
            // line 64
            yield "\">
            ";
yield _gettext("Server:");
            // line 66
            yield "          </label>
          <div class=\"col-sm-8\">
            <input type=\"text\" name=\"pma_servername\" id=\"serverNameInput\" value=\"";
            // line 68
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["default_server"] ?? null), "html", null, true);
            yield "\" class=\"form-control\" title=\"";
yield _gettext("You can enter hostname/IP address and port separated by space.");
            // line 69
            yield "\">
          </div>
        </div>
      ";
        }
        // line 73
        yield "
      <div class=\"row mb-3\">
        <label for=\"input_username\" class=\"col-sm-4 col-form-label\">
          ";
yield _gettext("Username:");
        // line 77
        yield "        </label>
        <div class=\"col-sm-8\">
          <input type=\"text\" name=\"pma_username\" id=\"input_username\" value=\"";
        // line 79
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["default_user"] ?? null), "html", null, true);
        yield "\" class=\"form-control\" autocomplete=\"username\" spellcheck=\"false\">
        </div>
      </div>

      <div class=\"row\">
        <label for=\"input_password\" class=\"col-sm-4 col-form-label\">
          ";
yield _gettext("Password:");
        // line 86
        yield "        </label>
        <div class=\"col-sm-8\">
          <input type=\"password\" name=\"pma_password\" id=\"input_password\" value=\"\" class=\"form-control\" autocomplete=\"current-password\" spellcheck=\"false\">
        </div>
      </div>

      ";
        // line 92
        if (($context["has_servers"] ?? null)) {
            // line 93
            yield "        <div class=\"row mt-3\">
          <label for=\"select_server\" class=\"col-sm-4 col-form-label\">
            ";
yield _gettext("Server choice:");
            // line 96
            yield "          </label>
          <div class=\"col-sm-8\">
            <select name=\"server\" id=\"select_server\" class=\"form-select\"";
            // line 99
            if (($context["is_arbitrary_server_allowed"] ?? null)) {
                yield " onchange=\"document.forms['login_form'].elements['pma_servername'].value = ''\"";
            }
            yield ">
              ";
            // line 100
            yield ($context["server_options"] ?? null);
            yield "
            </select>
          </div>
        </div>
      ";
        } else {
            // line 105
            yield "        <input type=\"hidden\" name=\"server\" value=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["server"] ?? null), "html", null, true);
            yield "\">
      ";
        }
        // line 107
        yield "    </div>
    <div class=\"card-footer\">
      ";
        // line 109
        if (($context["has_captcha"] ?? null)) {
            // line 110
            yield "        <script src=\"";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["captcha_api"] ?? null), "html", null, true);
            yield "?hl=";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["lang"] ?? null), "html", null, true);
            yield "\" async defer></script>
        ";
            // line 111
            if (($context["use_captcha_checkbox"] ?? null)) {
                // line 112
                yield "          <div class=\"row g-3\">
            <div class=\"col\">
              <div class=\"";
                // line 114
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["captcha_req"] ?? null), "html", null, true);
                yield "\" data-sitekey=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["captcha_key"] ?? null), "html", null, true);
                yield "\"></div>
            </div>
            <div class=\"col align-self-center text-end\">
              <input class=\"btn btn-primary\" value=\"";
yield _gettext("Log in");
                // line 117
                yield "\" type=\"submit\" id=\"input_go\">
            </div>
          </div>
        ";
            } else {
                // line 121
                yield "          <input class=\"btn btn-primary ";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["captcha_req"] ?? null), "html", null, true);
                yield "\" data-sitekey=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["captcha_key"] ?? null), "html", null, true);
                yield "\" data-callback=\"Functions_recaptchaCallback\" value=\"";
yield _gettext("Log in");
                yield "\" type=\"submit\" id=\"input_go\">
        ";
            }
            // line 123
            yield "      ";
        } else {
            // line 124
            yield "        <input class=\"btn btn-primary\" value=\"";
yield _gettext("Log in");
            yield "\" type=\"submit\" id=\"input_go\">
      ";
        }
        // line 126
        yield "    </div>
  </div>
</form>

";
        // line 130
        if ( !Twig\Extension\CoreExtension::testEmpty(($context["errors"] ?? null))) {
            // line 131
            yield "  <div id=\"pma_errors\">
    ";
            // line 132
            yield ($context["errors"] ?? null);
            yield "
  </div>
  </div>
  </div>
";
        }
        // line 137
        yield "
";
        // line 138
        yield ($context["login_footer"] ?? null);
        yield "

";
        // line 140
        yield ($context["config_footer"] ?? null);
        yield "
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "login/form.twig";
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
        return array (  334 => 140,  329 => 138,  326 => 137,  318 => 132,  315 => 131,  313 => 130,  307 => 126,  301 => 124,  298 => 123,  288 => 121,  282 => 117,  273 => 114,  269 => 112,  267 => 111,  260 => 110,  258 => 109,  254 => 107,  248 => 105,  240 => 100,  234 => 99,  230 => 96,  225 => 93,  223 => 92,  215 => 86,  205 => 79,  201 => 77,  195 => 73,  189 => 69,  185 => 68,  181 => 66,  177 => 64,  173 => 63,  171 => 62,  164 => 59,  158 => 55,  154 => 53,  152 => 52,  148 => 51,  143 => 50,  137 => 48,  134 => 46,  126 => 40,  119 => 38,  117 => 37,  111 => 36,  107 => 35,  102 => 33,  98 => 32,  93 => 29,  89 => 25,  86 => 24,  79 => 19,  77 => 18,  72 => 16,  69 => 15,  64 => 12,  62 => 7,  58 => 11,  55 => 8,  53 => 7,  49 => 5,  45 => 4,  43 => 3,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "login/form.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\login\\form.twig");
    }
}
