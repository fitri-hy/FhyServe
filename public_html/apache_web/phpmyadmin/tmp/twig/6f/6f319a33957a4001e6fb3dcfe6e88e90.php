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

/* login/header.twig */
class __TwigTemplate_38683c0373e064cc936a260b99d9283b extends Template
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
        if ((($context["session_expired"] ?? null) == true)) {
            // line 2
            yield "    <div id=\"modalOverlay\">
";
        }
        // line 4
        yield "<div class=\"container";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["add_class"] ?? null), "html", null, true);
        yield "\">
<div class=\"row\">
<div class=\"col-12\">
<a href=\"";
        // line 7
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(PhpMyAdmin\Core::linkURL("https://www.phpmyadmin.net/"), "html", null, true);
        yield "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"logo\">
<img src=\"";
        // line 8
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['PhpMyAdmin\Twig\AssetExtension']->getImagePath("logo_right.png", "pma_logo.png"), "html", null, true);
        yield "\" id=\"imLogo\" name=\"imLogo\" alt=\"phpMyAdmin\" border=\"0\">
</a>
<h1>";
        // line 10
        yield Twig\Extension\CoreExtension::sprintf(_gettext("Welcome to %s"), "<bdo dir=\"ltr\" lang=\"en\">phpMyAdmin</bdo>");
        yield "</h1>

<noscript>
";
        // line 13
        yield $this->env->getFilter('error')->getCallable()(_gettext("Javascript must be enabled past this point!"));
        yield "
</noscript>

<div class=\"hide\" id=\"js-https-mismatch\">
";
        // line 17
        yield $this->env->getFilter('error')->getCallable()(_gettext("There is a mismatch between HTTPS indicated on the server and client. This can lead to a non working phpMyAdmin or a security risk. Please fix your server configuration to indicate HTTPS properly."));
        yield "
</div>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "login/header.twig";
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
        return array (  73 => 17,  66 => 13,  60 => 10,  55 => 8,  51 => 7,  44 => 4,  40 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "login/header.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\login\\header.twig");
    }
}
