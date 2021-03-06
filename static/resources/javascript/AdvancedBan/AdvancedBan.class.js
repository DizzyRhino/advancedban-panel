class AdvancedBan {
	
	static initialize(callback) {
		this._templates = { };
		this._search = { };
		
		Cookie.initialize("AdvancedBan");
		
		this._configuration = new Configuration("static/configuration.json", function( ) {
			
			AdvancedBan.language = new Language(Cookie.get("language") ? Cookie.get("language") : AdvancedBan.configuration.get(["default", "language"]), function( ) {
				
				let templates = [["copied", ["copied"]], ["copy", ["copy"]], ["error-no-punishments", ["error_no_punishments"]], ["page", ["status", "page", "text"]], ["punishment", ["id", "type", "name", "reason", "operator", "date", "expires", "status"]], ["time", ["time"]], ["table", ["type", "name", "reason", "operator", "date", "expires", "status"]]];
				setTemplate(templates, 0, callback);
			
			});
		
		});
	}
	
	static get cache( ) {
		return this._cache;
	}
	
	static set cache(cache) {
		this._cache = cache;
	}
	
	static get configuration( ) {
		return this._configuration;
	}
	
	static set configuration(configuration) {
		this._configuration = configuration;
	}
	
	static get language( ) {
		return this._language;
	}
	
	static set language(language) {
		this._language = language;
	}
	
	static set Punishments(Punishments) {
		this._Punishments = Punishments;
	}
	
	static get Punishments( ) {
		return this._Punishments;
	}
	
	static set PunishmentHistory(PunishmentHistory) {
		this._PunishmentHistory = PunishmentHistory;
	}
	
	static get PunishmentHistory( ) {
		return this._PunishmentHistory;
	}
	
	static set template(template) {
		this._template = template;
	}
	
	static get template( ) {
		return this._template;
	}
	
	static set search(search) {
		this._search = search;
	}
	
	static get search( ) {
		return this._search;
	}
	
	static setTemplate(name, template) {
		this._templates[name] = template;
	}
	
	static getTemplate(template) {
		return this._templates[template];
	}
	
	static sort( ) {
		this._cache = [ ];
		
		$.each(this._PunishmentHistory, function(index, value) {
			if(AdvancedBan.filter(value)) {
				let cache = AdvancedBan.cache;
				cache.push(AdvancedBan.PunishmentHistory[index]);
				AdvancedBan.cache = cache;
			}
		});
		
		this._cache.sort(function(a, b) {
			return parseInt(a.id) > parseInt(b.id) ? -1 : parseInt(a.id) < parseInt(b.id) ? 1 : 0;
		});
	}
	
	static load(page) {
		let list = this._cache.splice((page - 1) * 25, 25);
		let amount = this._cache.length;
		
		let pages = Math.floor(amount / 25);
		
		if(amount % 25 > 0 || amount === 0) {
			pages++;
		}
		
		let minimum;
		let maximum;
		
		if(page < 5) {
			minimum = 1, maximum = 9;
		} else if(page > pages - 8) {
			minimum = pages - 8, maximum = pages;
		} else {
			minimum = page - 4, maximum = page + 4;
		}
		
		minimum = Math.max(1, minimum);
		maximum = Math.min(pages, maximum);
		
		$(".punishment-wrapper").html(this.getTemplate("table").replace([this._language.get("type", "Type"), this._language.get("name", "Name"), this._language.get("reason", "Reason"), this._language.get("operator", "Operator"), this._language.get("date", "Date"), this._language.get("expires", "Expires"), this._language.get("status", "Status")]));
		$("tbody, .pagination").empty( );
		
		if(list.length === 0) {
			$("tbody").html(this.getTemplate("error-no-punishments").replace(AdvancedBan.language.get("error_no_punishments", "No punishments could be listed on this page")));
		} else {
			$.each(list, function(index, value) {
				let date = new Date(isNaN(value.start) ? parse(value.start) : parseInt(value.start)); 
				let expires;
				
				if(value.end && value.end.length > 2) {
					expires = new Date(isNaN(value.end) ? parse(value.end) : parseInt(value.end));
				}
				
				$("tbody").append(AdvancedBan.getTemplate("punishment").replace([value.id, AdvancedBan.language.get(value.punishmentType.toLowerCase( ), value.punishmentType), value.name, value.reason, value.operator, date.toLocaleString(AdvancedBan.language.discriminator, {month: "long", day: "numeric", year: "numeric"}) + " " + AdvancedBan.getTemplate("time").replace([date.toLocaleString(AdvancedBan.language.discriminator, {hour: "numeric", minute: "numeric"})]), value.end && value.end.length > 2 ? expires.toLocaleString(AdvancedBan.language.discriminator, {month: "long", day: "numeric", year: "numeric"}) + " " + AdvancedBan.getTemplate("time").replace([expires.toLocaleString(AdvancedBan.language.discriminator, {hour: "numeric", minute: "numeric"})]) : AdvancedBan.language.get("error_not_evaluated", "N/A"), AdvancedBan.active(value.start, value.end) ? AdvancedBan.language.get("active", "Active") : AdvancedBan.language.get("inactive", "Inactive")]));
			});
		}
		
		if(page > 1) {
			$(".pagination").append(this.getTemplate("page").replace(["inactive", 1, AdvancedBan.language.get("first", "First")])).append(this.getTemplate("page").replace(["inactive", page - 1, AdvancedBan.language.get("previous", "Previous")]));
		}

		for( ; minimum <= maximum; minimum++) {
			$(".pagination").append(this.getTemplate("page").replace([page === minimum ? "active" : "inactive", minimum, minimum]));
		}
		
		if(page < pages) {
			$(".pagination").append(this.getTemplate("page").replace(["inactive", page + 1, AdvancedBan.language.get("next", "Next")])).append(this.getTemplate("page").replace(["inactive", pages, AdvancedBan.language.get("last", "Last")]));
		}
		
		setPictures( );
	}
	
	static get(callback) {
		$.getJSON(this._configuration.get(["mod_rewrite"]) === true ? "punishments" : "?request=punishments", function(data) {
			AdvancedBan.Punishments = data.Punishments;
			AdvancedBan.PunishmentHistory = data.PunishmentHistory;
			
			callback( );
		});
	}
	
	static active(date, expires) {
		let active = false;
		
		$.each(this._Punishments, function(index, value) {
			if(value.start === date && value.end === expires) {
				active = true;
			}
		});
		
		return active;
	}
	
	static filter(punishment) {
		if(this._search.punishmentType && this._search.punishmentType.length > 0 && this._search.punishmentType.includes(punishment.punishmentType.toLowerCase( )) === false) {
			return false;
		}
		
		if(this._search.punishmentStatus && this._search.punishmentStatus.length > 0 && this._search.punishmentStatus.includes(active(punishment.start, punishment.end) ? "active" : "inactive") === false) {
			return false;
		}
		
		if(this._search.inputType && this._search.input && this._search.inputType.length > 0 && this._search.input) {
			let valid = false;
			
			$.each(this._search.inputType, function(index, value) {
				if(punishment[value].toLowerCase( ).includes(this._search.inputType.toLowerCase( ))) {
					valid = true;
				}
			});
			
			if(valid === false) {
				return false;
			}
		}
		
		if(this._search.input && punishment.name.toLowerCase( ).includes(this._search.input.toLowerCase( )) === false && punishment.reason.toLowerCase( ).includes(this._search.input.toLowerCase( )) === false && punishment.operator.toLowerCase( ).includes(this._search.input.toLowerCase( )) === false) {
			return false;
		}
		
		return true;
	}
	
}