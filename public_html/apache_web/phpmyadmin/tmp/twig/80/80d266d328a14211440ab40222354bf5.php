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

/* preferences/autoload.twig */
class __TwigTemplate_e64943fb2a93cb80cfb20c76dde76018 extends Template
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
        yield "<div id=\"prefs_autoload\" class=\"alert alert-primary d-print-none hide\" role=\"alert\">
    <form action=\"";
        // line 2
        yield PhpMyAdmin\Url::getFromRoute("/preferences/manage");
        yield "\" method=\"post\" class=\"disableAjax\">
        ";
        // line 3
        yield ($context["hidden_inputs"] ?? null);
        yield "
        <input type=\"hidden\" name=\"json\" value=\"\">
        <input type=\"hidden\" name=\"submit_import\" value=\"1\">
        <input type=\"hidden\" name=\"return_url\" value=\"";
        // line 6
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["return_url"] ?? null), "html", null, true);
        yield "\">
        ";
yield _gettext("Your browser has phpMyAdmin configuration for this domain. Would you like to import it for current session?");
        // line 10
        yield "        <br>
        <a href=\"#yes\">";
yield _gettext("Yes");
        // line 11
        yield "</a>
        / <a href=\"#no\">";
yield _gettext("No");
        // line 12
        yield "</a>
        / <a href=\"#delete\">";
yield _gettext("Delete settings");
        // line 13
        yield "</a>
    </form>
</div>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "preferences/autoload.twig";
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
        return array (  68 => 13,  64 => 12,  60 => 11,  56 => 10,  51 => 6,  45 => 3,  41 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "preferences/autoload.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\preferences\\autoload.twig");
    }
}
