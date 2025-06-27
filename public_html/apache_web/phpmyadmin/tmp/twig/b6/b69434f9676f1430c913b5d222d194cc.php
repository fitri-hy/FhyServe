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

/* error/generic.twig */
class __TwigTemplate_9f97cd7692f1a3f4274aa5b7a56b1bcf extends Template
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
        yield "<!DOCTYPE HTML>
<html lang=\"";
        // line 2
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["lang"] ?? null), "html", null, true);
        yield "\" dir=\"";
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(($context["dir"] ?? null), "html", null, true);
        yield "\">
<head>
    <link rel=\"icon\" href=\"favicon.ico\" type=\"image/x-icon\">
    <link rel=\"shortcut icon\" href=\"favicon.ico\" type=\"image/x-icon\">
    <title>phpMyAdmin</title>
    <meta charset=\"utf-8\">
    <style type=\"text/css\">
        html {
            padding: 0;
            margin: 0;
        }
        body  {
            font-family: sans-serif;
            font-size: small;
            color: #000000;
            background-color: #F5F5F5;
            margin: 1em;
        }
        h1 {
            margin: 0;
            padding: 0.3em;
            font-size: 1.4em;
            font-weight: bold;
            color: #ffffff;
            background-color: #ff0000;
        }
        p {
            margin: 0;
            padding: 0.5em;
            border: 0.1em solid red;
            background-color: #ffeeee;
        }
    </style>
</head>
<body>
<h1>phpMyAdmin - ";
yield _gettext("Error");
        // line 37
        yield "</h1>
<p>";
        // line 38
        yield ($context["error_message"] ?? null);
        yield "</p>
</body>
</html>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "error/generic.twig";
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
        return array (  85 => 38,  82 => 37,  41 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "error/generic.twig", "C:\\xampp\\htdocs\\demo\\FhyApp\\htdocs\\phpmyadmin\\templates\\error\\generic.twig");
    }
}
