<?php

use AdvancedBan\User\Language;
use AdvancedBan\User\Theme;

use AdvancedBan\Storage\Cookie;

use AdvancedBan\Database;
use AdvancedBan\Configuration;
use AdvancedBan\Template;
use AdvancedBan\Request;

class AdvancedBan {
	
	private static $root;
	
	private static $database;
	private static $configuration;
	
	private static $cookie;
	
	private static $language;
	private static $theme;
	
	private static $request;
	
	public static function initialize(string $root) {
		self::$root = $root;
		
		self::$database = new Database(DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_DATABASE);
		self::$configuration = new Configuration("/static/configuration.json");
		
		self::$cookie = new Cookie("AdvancedBan");
		
		self::$language = new Language(self::$cookie->get("language") ? self::$cookie->get("language") : self::$configuration->get(["default", "language"]));
		self::$theme = new Theme(self::$cookie->get("theme") ? self::$cookie->get("theme") : self::$configuration->get(["default", "theme"]));
		
		self::$request = new Request(isset($_GET["request"]) ? $_GET["request"] : "/");
		
		if(self::$request->getAbsolute( )) {
			require_once self::$request->getAbsolute( );
		} else {
			http_response_code(404);
		}
	}
	
	public static function getRoot( ) {
		return self::$root;
	}
	
	public static function getDatabase( ) {
		return self::$database;
	}
	
	public static function getConfiguration( ) {
		return self::$configuration;
	}
	
	public static function getCookie( ) {
		return self::$cookie;
	}
	
	public static function getLanguage( ) {
		return self::$language;
	}
	
	public static function getTheme( ) {
		return self::$theme;
	}
	
	public static function getRequest( ) {
		return self::$request;
	}
	
}
