/* Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file  ap_config_layout.h
 * @brief Apache Config Layout
 */

#ifndef AP_CONFIG_LAYOUT_H
#define AP_CONFIG_LAYOUT_H

/* Configured Apache directory layout */
#define DEFAULT_PREFIX "/etc/httpd22"
#define DEFAULT_EXP_EXEC_PREFIX "/usr"
#define DEFAULT_REL_EXEC_PREFIX "/usr"
#define DEFAULT_EXP_BINDIR "/usr/bin"
#define DEFAULT_REL_BINDIR "/usr/bin"
#define DEFAULT_EXP_SBINDIR "/usr/sbin"
#define DEFAULT_REL_SBINDIR "/usr/sbin"
#define DEFAULT_EXP_LIBEXECDIR "/usr/lib64/httpd22/modules"
#define DEFAULT_REL_LIBEXECDIR "/usr/lib64/httpd22/modules"
#define DEFAULT_EXP_MANDIR "/usr/share/man"
#define DEFAULT_REL_MANDIR "/usr/share/man"
#define DEFAULT_EXP_SYSCONFDIR "/etc/httpd22/conf"
#define DEFAULT_REL_SYSCONFDIR "conf"
#define DEFAULT_EXP_DATADIR "/var/www/httpd22"
#define DEFAULT_REL_DATADIR "/var/www/httpd22"
#define DEFAULT_EXP_INSTALLBUILDDIR "/usr/lib64/httpd/build"
#define DEFAULT_REL_INSTALLBUILDDIR "/usr/lib64/httpd/build"
#define DEFAULT_EXP_ERRORDIR "/var/www/httpd22/error"
#define DEFAULT_REL_ERRORDIR "/var/www/httpd22/error"
#define DEFAULT_EXP_ICONSDIR "/var/www/httpd22/icons"
#define DEFAULT_REL_ICONSDIR "/var/www/httpd22/icons"
#define DEFAULT_EXP_HTDOCSDIR "/var/www/httpd22/htdocs"
#define DEFAULT_REL_HTDOCSDIR "/var/www/httpd22/htdocs"
#define DEFAULT_EXP_MANUALDIR "/var/www/httpd22/manual"
#define DEFAULT_REL_MANUALDIR "/var/www/httpd22/manual"
#define DEFAULT_EXP_CGIDIR "/var/www/httpd22/cgi-bin"
#define DEFAULT_REL_CGIDIR "/var/www/httpd22/cgi-bin"
#define DEFAULT_EXP_INCLUDEDIR "/usr/include/httpd22"
#define DEFAULT_REL_INCLUDEDIR "/usr/include/httpd22"
#define DEFAULT_EXP_LOCALSTATEDIR "/etc/httpd22"
#define DEFAULT_REL_LOCALSTATEDIR ""
#define DEFAULT_EXP_RUNTIMEDIR "/etc/httpd22/logs"
#define DEFAULT_REL_RUNTIMEDIR "logs"
#define DEFAULT_EXP_LOGFILEDIR "/etc/httpd22/logs"
#define DEFAULT_REL_LOGFILEDIR "logs"
#define DEFAULT_EXP_PROXYCACHEDIR "/etc/httpd22/proxy"
#define DEFAULT_REL_PROXYCACHEDIR "proxy"

#endif /* AP_CONFIG_LAYOUT_H */
